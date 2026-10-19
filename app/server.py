#!/usr/bin/env python3
import json, os, io, csv, time, hmac, hashlib, base64, secrets, urllib.request, re, threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

BASE=os.path.dirname(os.path.abspath(__file__))
DATA_DIR=os.environ.get('WT_DATA_DIR') or os.path.expanduser('~/Library/Application Support/WorkTracker/data')  # WT_DATA_DIR = persistent disk on cloud (unset locally = same as before)
os.makedirs(DATA_DIR, exist_ok=True)
STATE_LOCK=threading.RLock()
DATA_FILE=os.path.join(DATA_DIR,'data.json')
USERS_FILE=os.path.join(DATA_DIR,'users.json')
CONFIG_FILE=os.path.join(DATA_DIR,'config.json')
TEMPLATE=os.path.join(BASE,'index.html')
LOGIN_TPL=os.path.join(BASE,'login.html')
PORT=int(os.environ.get('PORT') or os.environ.get('WT_PORT','8787'))  # honor Render's $PORT; falls back to WT_PORT/8787 locally
HOST=os.environ.get('WT_HOST','0.0.0.0')  # 0.0.0.0 = LAN/team access; 127.0.0.1 = local-only
COOKIE='wt_session'
TTL=7*24*3600

DEMO_USERS=[
 {'name':'Gift','code':'gift1234','team':'Communication','role':'Manager','capacity':'12','email':'gift@example.com'},
 {'name':'Mint','code':'mint1234','team':'Creative','role':'Creator','capacity':'12','email':'mint@example.com'},
 {'name':'Beam','code':'beam1234','team':'Creative','role':'Creator','capacity':'12','email':'beam@example.com'},
 {'name':'Ploy','code':'ploy1234','team':'Quality','role':'Checker','capacity':'12','email':'ploy@example.com'},
 {'name':'Nok','code':'nok1234','team':'Approval','role':'Approver','capacity':'12','email':'nok@example.com'},
]

def jread(p,default):
    try:
        with open(p,encoding='utf-8') as f: return json.load(f)
    except Exception: return default
def jwrite(p,obj):
    tmp=p+'.tmp'
    with open(tmp,'w',encoding='utf-8') as f: json.dump(obj,f,ensure_ascii=False,indent=0)
    os.replace(tmp,p)

def get_config():
    cfg=jread(CONFIG_FILE,{})
    if not cfg.get('secret'):
        cfg['secret']=secrets.token_hex(32)
        jwrite(CONFIG_FILE,cfg)
    return cfg
def save_config(cfg): jwrite(CONFIG_FILE,cfg)

def get_users():
    us=jread(USERS_FILE,None)
    if not isinstance(us,list) or not us:
        jwrite(USERS_FILE, DEMO_USERS); return list(DEMO_USERS)
    return us

# ---- Google Sheet import ----
def to_csv_url(url):
    url=url.strip()
    m=re.search(r'/spreadsheets/d/([a-zA-Z0-9-_]+)', url)
    if m and ('/edit' in url or '/view' in url or url.endswith('/'+m.group(1)) or 'edit' in url):
        gid=''
        g=re.search(r'[#&?]gid=(\d+)', url)
        if g: gid=g.group(1)
        return 'https://docs.google.com/spreadsheets/d/%s/export?format=csv%s'%(m.group(1),('&gid='+gid if gid else ''))
    return url

def _find(headers,cands):
    # exact match first
    for i,h in enumerate(headers):
        if h in cands: return i
    for i,h in enumerate(headers):
        for c in cands:
            if c and c in h: return i
    return -1

def fetch_users_from_url(url):
    real=to_csv_url(url)
    req=urllib.request.Request(real, headers={'User-Agent':'WorkTracker/1.0'})
    with urllib.request.urlopen(req, timeout=15) as r:
        raw=r.read().decode('utf-8-sig', errors='replace')
    rows=list(csv.reader(io.StringIO(raw)))
    if not rows: return []
    headers=[(h or '').strip().lower() for h in rows[0]]
    i_name=_find(headers,['name','ชื่อ','username','ผู้ใช้','fullname','ชื่อ-สกุล','ชื่อ-นามสกุล'])
    i_code=_find(headers,['password','รหัสผ่าน','รหัสเข้าสู่ระบบ','รหัสเข้าระบบ','passcode','login code','pin','pass','code','รหัส'])
    i_team=_find(headers,['team','ทีม','แผนก','department','กลุ่ม'])
    i_role=_find(headers,['role','บทบาท','สิทธิ์','สิทธิ','ตำแหน่ง','position'])
    i_cap =_find(headers,['capacity','โควตา','ภาระ','คะแนน'])
    i_mail=_find(headers,['email','อีเมล','sso id','sso','user id','userid','employee id','รหัสพนักงาน'])
    out=[]
    for row in rows[1:]:
        if not any((c or '').strip() for c in row): continue
        g=lambda i:(row[i].strip() if 0<=i<len(row) else '')
        name=g(i_name)
        if not name: continue
        out.append({'name':name,'code':g(i_code),'team':g(i_team),'role':g(i_role),'capacity':g(i_cap),'email':g(i_mail)})
    return out

def refresh_users():
    cfg=get_config()
    url=cfg.get('users_csv_url','').strip()
    if not url: return (False,'ยังไม่ได้ตั้งค่าลิงก์ Google Sheet',0)
    try:
        users=fetch_users_from_url(url)
    except Exception as e:
        return (False,'ดึงข้อมูลไม่สำเร็จ: %s'%e,0)
    if not users:
        return (False,'ไม่พบข้อมูลผู้ใช้ในชีต (ตรวจหัวคอลัมน์ ชื่อ/รหัส)',0)
    jwrite(USERS_FILE, users)
    cfg['users_source']='sheet'; save_config(cfg)
    return (True,'',len(users))

def user_source():
    return get_config().get('users_source','demo')

# ---- token ----
def make_token(u):
    cfg=get_config()
    payload={'n':u['name'],'t':u.get('team',''),'r':u.get('role',''),'exp':int(time.time())+TTL}
    raw=base64.urlsafe_b64encode(json.dumps(payload,ensure_ascii=False).encode()).decode()
    sig=hmac.new(cfg['secret'].encode(),raw.encode(),hashlib.sha256).hexdigest()[:32]
    return raw+'.'+sig
def parse_token(tok):
    try:
        cfg=get_config(); raw,sig=tok.split('.',1)
        good=hmac.new(cfg['secret'].encode(),raw.encode(),hashlib.sha256).hexdigest()[:32]
        if not hmac.compare_digest(sig,good): return None
        p=json.loads(base64.urlsafe_b64decode(raw.encode()).decode())
        if p.get('exp',0)<time.time(): return None
        return {'name':p['n'],'team':p.get('t',''),'role':p.get('r','')}
    except Exception: return None

def authenticate(name,code):
    name=(name or '').strip(); code=(code or '').strip()
    if not name or not code: return None
    for u in get_users():
        if (u.get('name','').strip().lower()==name.lower()) and (str(u.get('code','')).strip()==code):
            return u
    return None


TH_MON={'ม.ค.':1,'ก.พ.':2,'มี.ค.':3,'เม.ย.':4,'พ.ค.':5,'มิ.ย.':6,'ก.ค.':7,'ส.ค.':8,'ก.ย.':9,'ต.ค.':10,'พ.ย.':11,'ธ.ค.':12}
def parse_thai_date(s):
    s=(s or '').strip()
    if not s: return ''
    if '/' in s:
        p=s.split('/')
        if len(p)!=3: return ''
        try: a=int(p[0]); b=int(p[1]); y=int(p[2])
        except Exception: return ''
        if a>12 and b<=12: d,m=a,b
        elif b>12 and a<=12: d,m=b,a
        else: d,m=a,b
        if y<100: y=2500+y
        if y>2400: y-=543
        try:
            import datetime; datetime.date(y,m,d)
        except Exception: return ''
        return '%04d-%02d-%02d'%(y,m,d)
    s2=s.replace(' ','')
    parts=s2.split('-')
    if len(parts)==3 and parts[1] in TH_MON:
        try: d=int(parts[0]); y=int(parts[2])
        except Exception: return ''
        be=2500+y if y<100 else y
        return '%04d-%02d-%02d'%(be-543,TH_MON[parts[1]],d)
    return ''

def fetch_csv(url):
    real=to_csv_url(url)
    req=urllib.request.Request(real, headers={'User-Agent':'WorkTracker/1.0'})
    with urllib.request.urlopen(req, timeout=20) as r:
        raw=r.read().decode('utf-8-sig', errors='replace')
    return list(csv.reader(io.StringIO(raw)))

def map_plan_rows(rows):
    hdr=-1
    for i,r in enumerate(rows):
        if any((c or '').strip()=='เรื่องสื่อสาร' for c in r): hdr=i; break
    if hdr<0: return []
    H=[(c or '').strip() for c in rows[hdr]]
    def idx(*labels):
        for lab in labels:
            for j,c in enumerate(H):
                if c==lab: return j
        return -1
    def g(r,j): return r[j].strip() if 0<=j<len(r) else ''
    def tf(v): return str(v).strip().upper()=='TRUE'
    STAT={'เสร็จสิ้น':'Completed','อยู่ระหว่างดำเนินการ':'In Progress','กำลังดำเนินการ':'In Progress'}
    out=[]
    merged = idx('ช่องทางสื่อสาร')>=0
    if merged:
        i_topic=idx('เรื่องสื่อสาร')
        if i_topic<1: return []
        i_date=i_topic-1
        i_time=idx('เวลาสื่อสาร'); i_cat=idx('หัวข้อ')
        i_chan=idx('ช่องทางสื่อสาร'); i_fmt=idx('รูปแบบสื่อ'); i_stat=idx('สถานะ')
        sub=rows[hdr+1] if hdr+1<len(rows) else []
        def lbl(j): return sub[j].strip() if j<len(sub) and sub[j].strip() else ('col%d'%j)
        chan_cols=list(range(i_chan,i_fmt)) if (i_chan>=0 and i_fmt>i_chan) else []
        fmt_cols=list(range(i_fmt,i_stat)) if (i_fmt>=0 and i_stat>i_fmt) else []
        for r in rows[hdr+2:]:
            title=g(r,i_topic)
            if not title: continue
            date=parse_thai_date(g(r,i_date))
            chans=[lbl(j) for j in chan_cols if tf(g(r,j))]
            fmts=[lbl(j) for j in fmt_cols if tf(g(r,j))]
            cat=g(r,i_cat) if i_cat>=0 else ''
            tm=g(r,i_time) if i_time>=0 else ''
            rs=g(r,i_stat) if i_stat>=0 else ''
            status=STAT.get(rs,'To Do')
            up=[f.upper() for f in fmts]
            kind='Video' if any('VDO' in f for f in up) else ('Infographic' if any('INFO' in f for f in up) else 'Copy')
            comm='Internal' if 'กระบวนการ' in cat else 'External'
            bp=[]
            if cat: bp.append('หัวข้อ: '+cat)
            if chans: bp.append('ช่องทาง: '+', '.join(chans))
            if fmts: bp.append('รูปแบบ: '+', '.join(fmts))
            if tm: bp.append('เวลา '+tm)
            t={'title':title,'project':'แผนสื่อสารรายสัปดาห์','comm':comm,'kind':kind,'priority':'Normal',
               'lead':'','support':'','checker':'','approver':'','due':date,'publish':date,'status':status,
               'brief':' · '.join(bp),'modes':{},'src':'sheet'}
            if status=='Completed' and date: t['completed']=date
            warn=[]
            if not date: warn.append('ไม่มีวันที่')
            if rs and rs not in STAT: warn.append('สถานะไม่รู้จัก: '+rs)
            t['_meta']={'channels':', '.join(chans),'formats':', '.join(fmts),'time':tm,'category':cat,'unit':''}
            t['_warn']=warn
            out.append(t)
        return out
    # ---- flat single-header table (DATE/NO/เรื่องสื่อสาร/ช่องทาง/หัวข้อ/หน่วยงาน/สถานะ) ----
    i_title=idx('เรื่องสื่อสาร')
    if i_title<0: return []
    i_date=idx('DATE','วันที่','วันที่สื่อสาร','Date')
    i_chan=idx('ช่องทาง','ช่องทางสื่อสาร')
    i_cat=idx('หัวข้อ')
    i_unit=idx('หน่วยงาน','ทีม','แผนก')
    i_stat=idx('สถานะ')
    i_fmt=idx('รูปแบบสื่อ','รูปแบบ')
    i_time=idx('เวลาสื่อสาร','เวลา')
    for r in rows[hdr+1:]:
        title=g(r,i_title)
        if not title: continue
        date=parse_thai_date(g(r,i_date)) if i_date>=0 else ''
        chan=g(r,i_chan) if i_chan>=0 else ''
        cat=g(r,i_cat) if i_cat>=0 else ''
        unit=g(r,i_unit) if i_unit>=0 else ''
        tm=g(r,i_time) if i_time>=0 else ''
        fmt=g(r,i_fmt) if i_fmt>=0 else chan
        rs=g(r,i_stat) if i_stat>=0 else ''
        status=STAT.get(rs,'To Do')
        up=(fmt or '').upper()
        kind='Video' if ('VDO' in up or 'VIDEO' in up) else ('Infographic' if 'INFO' in up else 'Copy')
        comm='External' if ('โปรโมชั่น' in cat or 'สื่อ' in cat) else 'Internal'
        bp=[]
        if cat: bp.append('หัวข้อ: '+cat)
        if chan: bp.append('ช่องทาง: '+chan)
        if unit: bp.append('หน่วยงาน: '+unit)
        if tm: bp.append('เวลา '+tm)
        t={'title':title,'project':('หน่วยงาน '+unit if unit else 'แผนสื่อสาร (Sheet)'),'comm':comm,'kind':kind,'priority':'Normal',
           'lead':'','support':'','checker':'','approver':'','due':date,'publish':date,'status':status,
           'brief':' · '.join(bp),'modes':{},'src':'sheet'}
        if status=='Completed' and date: t['completed']=date
        warn=[]
        if not date: warn.append('ไม่มีวันที่')
        if rs and rs not in STAT: warn.append('สถานะไม่รู้จัก: '+rs)
        t['_meta']={'channels':chan,'formats':(fmt if i_fmt>=0 else ''),'time':tm,'category':cat,'unit':unit}
        t['_warn']=warn
        out.append(t)
    return out

INTERNAL_TABS=['INTERNAL','Internal','internal','ภายใน']
EXTERNAL_TABS=['EXTERNAL1','EXTERNAL','External','external','ภายนอก','EXTERNAL 1']

def extract_sheet_id(url):
    m=re.search(r'/spreadsheets/d/([a-zA-Z0-9\-_]+)', url or '')
    return m.group(1) if m else ''

def gviz_csv(sid, tab):
    import urllib.parse
    u='https://docs.google.com/spreadsheets/d/%s/gviz/tq?tqx=out:csv&sheet=%s'%(sid, urllib.parse.quote(tab))
    return fetch_csv(u)

def map_media_plan(rows, comm):
    hdr=-1
    for i,r in enumerate(rows):
        if any((c or '').strip() in ('เรื่องสื่อสาร','เรื่อง') for c in r): hdr=i; break
    if hdr<0: return []
    H=[(c or '').strip() for c in rows[hdr]]
    def find(*labs):
        for lab in labs:
            for j,c in enumerate(H):
                if c==lab: return j
        return -1
    def findpfx(pfx):
        for j,c in enumerate(H):
            if c.startswith(pfx): return j
        return -1
    i_title=find('เรื่องสื่อสาร','เรื่อง')
    if i_title<0: return []
    i_date=find('วันที่','DATE','Date')
    i_proj=find('ชื่อโครงการ/แคมเปญ','ชื่อโครงการ/แคมเปน','ชื่อโครงการ','ชื่อแคมเปญ','แคมเปญ','โครงการ')
    i_cat=find('หัวข้อ'); i_unit=find('หน่วยงาน'); i_stat=find('สถานะ')
    i_chan=findpfx('ช่องทาง'); i_fmt=findpfx('รูปแบบ')
    stat_end=i_stat if i_stat>=0 else len(H)
    # merged two-row header: sub-labels (LINE/TOPHIT/BANNER/SMS , Infographic/VDO)
    # live on the row directly below the group row (ช่องทาง / รูปแบบ).
    SUB=None; data_start=hdr+1
    if hdr+1<len(rows):
        nxt=[(c or '').strip() for c in rows[hdr+1]]
        def _nb(v): return v!='' and v.upper() not in ('TRUE','FALSE','YES','NO','1','0','X','✓','✔')
        _te=(i_title>=len(nxt)) or (nxt[i_title]=='')
        _span=stat_end if stat_end>0 else len(nxt)
        _hs=(i_chan>=0) and any(_nb(nxt[j]) for j in range(i_chan,min(len(nxt),_span)))
        if _te and _hs: SUB=nxt; data_start=hdr+2
    chan_cols=list(range(i_chan,i_fmt)) if (i_chan>=0 and i_fmt>i_chan) else ([i_chan] if i_chan>=0 else [])
    fmt_cols=list(range(i_fmt,stat_end)) if (i_fmt>=0 and stat_end>i_fmt) else ([i_fmt] if i_fmt>=0 else [])
    def lbl(j):
        if SUB is not None and 0<=j<len(SUB) and SUB[j]: return SUB[j]
        c=H[j] if 0<=j<len(H) else ''
        for p in ('ช่องทางสื่อสาร','ช่องทาง','รูปแบบสื่อ','รูปแบบ'):
            if c.startswith(p): c=c[len(p):].strip(); break
        return c or ('col%d'%j)
    STAT={'เสร็จสิ้น':'Completed','ดำเนินการ':'In Progress','ระหว่างดำเนินการ':'In Progress','อยู่ระหว่างดำเนินการ':'In Progress'}
    def g(r,j): return r[j].strip() if 0<=j<len(r) else ''
    def tf(v): return str(v).strip().upper() in ('TRUE','YES','1','✓','✔')
    mode='internal' if comm=='Internal' else 'external'
    out=[]
    for r in rows[data_start:]:
        title=g(r,i_title)
        if not title: continue
        date=parse_thai_date(g(r,i_date)) if i_date>=0 else ''
        chans=[lbl(j) for j in chan_cols if tf(g(r,j))]
        fmts=[lbl(j) for j in fmt_cols if tf(g(r,j))]
        cat=g(r,i_cat) if i_cat>=0 else ''
        unit=g(r,i_unit) if i_unit>=0 else ''
        proj=g(r,i_proj) if i_proj>=0 else ''
        rs=g(r,i_stat) if i_stat>=0 else ''
        status=STAT.get(rs,'To Do')
        up=[f.upper() for f in fmts]
        kind='Video' if any(('VDO' in f or 'VIDEO' in f) for f in up) else ('Infographic' if any('INFO' in f for f in up) else 'Copy')
        bp=[]
        if cat: bp.append('หัวข้อ: '+cat)
        if unit: bp.append('หน่วยงาน: '+unit)
        if chans: bp.append('ช่องทาง: '+', '.join(chans))
        if fmts: bp.append('รูปแบบ: '+', '.join(fmts))
        t={'title':title,'project':(proj or ('หน่วยงาน '+unit if unit else 'DATA Media Plan')),'comm':comm,'kind':kind,'priority':'Normal',
           'lead':'','support':'','checker':'','approver':'','due':date,'publish':date,'status':status,
           'brief':' · '.join(bp),'modes':{},'src':'sheet','srcMode':mode}
        if status=='Completed' and date: t['completed']=date
        warn=[]
        if not date: warn.append('ไม่มีวันที่')
        if rs and rs not in STAT: warn.append('สถานะไม่รู้จัก: '+rs)
        t['_meta']={'channels':', '.join(chans),'formats':', '.join(fmts),'time':'','category':cat,'unit':unit}
        t['_warn']=warn
        out.append(t)
    return out

def channel_labels(rows):
    hdr=-1
    for i,r in enumerate(rows):
        if any((c or '').strip() in ('เรื่องสื่อสาร','เรื่อง') for c in r): hdr=i; break
    if hdr<0: return []
    H=[(c or '').strip() for c in rows[hdr]]
    def findpfx(pfx):
        for j,c in enumerate(H):
            if c.startswith(pfx): return j
        return -1
    i_chan=findpfx('ช่องทาง'); i_fmt=findpfx('รูปแบบ')
    i_stat=-1
    for j,c in enumerate(H):
        if c=='สถานะ': i_stat=j; break
    if i_chan<0: return []
    end=i_fmt if i_fmt>i_chan else (i_stat if i_stat>i_chan else len(H))
    SUB=None
    if hdr+1<len(rows):
        nxt=[(c or '').strip() for c in rows[hdr+1]]
        if any((nxt[j] and nxt[j].upper() not in ('TRUE','FALSE','YES','NO','1','0','X','✓','✔')) for j in range(i_chan,min(len(nxt),end))):
            SUB=nxt
    labs=[]
    for j in range(i_chan, end):
        if SUB is not None and j<len(SUB) and SUB[j] and SUB[j].upper() not in ('TRUE','FALSE'):
            labs.append(SUB[j]); continue
        c=H[j] if j<len(H) else ''
        for p in ('ช่องทางสื่อสาร','ช่องทาง'):
            if c.startswith(p): c=c[len(p):].strip(); break
        if c: labs.append(c)
    return labs

def raw_tab_ok(rows, mode):
    txt=' '.join(' '.join((c or '') for c in r) for r in rows[:10])
    if mode=='internal': return ('หน่วยงาน' in txt or 'หัวข้อ' in txt or 'จำนวน' in txt)
    return ('ชื่อโครงการ' in txt or 'แคมเปญ' in txt or 'วันเผยแพร่' in txt or 'วันดำเนินการ' in txt)

def tab_matches(rows, mode):
    labs=[l.upper() for l in channel_labels(rows)]
    if not labs: return False
    cust=any(any(k in l for k in ('LINE','SMS','BANNER','TOPHIT','TOP HIT')) for l in labs)
    return cust if mode=='external' else (not cust)

def fetch_media_tab(url, mode):
    sid=extract_sheet_id(url)
    if not sid: raise ValueError('ไม่พบรหัสสเปรดชีตจากลิงก์')
    comm='Internal' if mode=='internal' else 'External'
    cands=INTERNAL_TABS if mode=='internal' else EXTERNAL_TABS
    last=None; seen=False
    for tab in cands:
        try:
            rows=gviz_csv(sid,tab)
        except Exception as e:
            last=e; continue
        # gviz falls back to another tab when the requested name is missing;
        # only accept a tab whose channel columns match the requested mode.
        if not tab_matches(rows, mode):
            seen=True; continue
        m=map_media_plan(rows, comm)
        if m: return m, tab
    if last:
        msg=str(last)
        if any(code in msg for code in ('404','403','401')):
            raise ValueError('เข้าถึงชีตไม่ได้ — โปรดตั้งค่าแชร์เป็น “ทุกคนที่มีลิงก์ดูได้” หรือ Publish to web แล้วลองใหม่')
        raise last
    if seen:
        raise ValueError('พบชีตแต่ไม่พบแท็บที่ตรงกับโหมด %s (External ต้องมีช่องทาง LINE/SMS/BANNER/TOPHIT · Internal เป็นบันทึก)'%mode)
    return [], None

def import_data(url=None, mode=None):
    cfg=get_config()
    url=(url or cfg.get('data_csv_url','')).strip()
    if not url: return (False,'ยังไม่ได้ตั้งค่าลิงก์ชีตข้อมูล',0)
    if mode in ('internal','external'):
        try: mapped,tab=fetch_media_tab(url,mode)
        except Exception as e: return (False,'ดึงข้อมูลไม่สำเร็จ: %s'%e,0)
        if not mapped: return (False,'ไม่พบข้อมูลในแท็บ %s'%mode,0)
        for m in mapped: m.pop('_meta',None); m.pop('_warn',None); m['status']='To Do'; m.pop('completed',None)
        d=jread(DATA_FILE,{})
        try: tasks=json.loads(d.get('worktracker-tasks-v1','[]'))
        except Exception: tasks=[]
        if not isinstance(tasks,list): tasks=[]
        kept=[t for t in tasks if not (t.get('src')=='sheet' and t.get('srcMode') in (None,'',mode))]
        base=200000 if mode=='internal' else 400000
        for i,m in enumerate(mapped): m['id']=base+i
        tasks=mapped+kept
        d['worktracker-tasks-v1']=json.dumps(tasks,ensure_ascii=False)
        jwrite(DATA_FILE,d)
        cfg['data_csv_url']=url; save_config(cfg)
        return (True,'',len(mapped))
    # legacy no-mode: whole-sheet auto mapper, full replace of sheet tasks
    try: rows=fetch_csv(url)
    except Exception as e: return (False,'ดึงข้อมูลไม่สำเร็จ: %s'%e,0)
    mapped=map_plan_rows(rows)
    if not mapped: return (False,'ไม่พบข้อมูลงานในชีต (ตรวจหัวคอลัมน์ เรื่องสื่อสาร/สถานะ)',0)
    for i,m in enumerate(mapped):
        m['id']=200000+i; m.pop('_meta',None); m.pop('_warn',None); m['status']='To Do'; m.pop('completed',None)
    d=jread(DATA_FILE,{})
    d['worktracker-tasks-v1']=json.dumps(mapped,ensure_ascii=False)
    jwrite(DATA_FILE,d)
    cfg['data_csv_url']=url; save_config(cfg)
    return (True,'',len(mapped))

def line_push(to, text):
    cfg=get_config(); tok=(cfg.get('line_token') or '').strip()
    if not tok: return (False,'ยังไม่ได้ตั้งค่า LINE Channel Access Token')
    if not to: return (False,'ไม่มีปลายทาง (userId/groupId)')
    body=json.dumps({'to':to,'messages':[{'type':'text','text':(text or '')[:4900]}]}).encode('utf-8')
    req=urllib.request.Request('https://api.line.me/v2/bot/message/push',data=body,headers={'Content-Type':'application/json','Authorization':'Bearer '+tok},method='POST')
    try:
        with urllib.request.urlopen(req,timeout=12) as r:
            return (True,'')
    except urllib.error.HTTPError as e:
        try: msg=e.read().decode('utf-8','replace')[:300]
        except Exception: msg=''
        return (False,'LINE HTTP %s: %s'%(e.code,msg))
    except Exception as e:
        return (False,str(e))

def line_send_targets(text, targets):
    cfg=get_config(); res={}
    ids={'manager':(cfg.get('line_manager_id') or '').strip(),'group':(cfg.get('line_group_id') or '').strip()}
    any_ok=False
    for t in targets:
        tid=ids.get(t,'')
        if not tid:
            res[t]={'ok':False,'error':'ยังไม่ได้ตั้งค่าปลายทางนี้'}; continue
        ok,err=line_push(tid,text)
        res[t]={'ok':ok,'error':err}
        any_ok=any_ok or ok
    return any_ok,res

def is_admin(user):
    return bool(user) and bool(re.search(r'(manager|admin|ผู้ดูแล|ผู้จัดการ)', (user.get('role') or ''), re.I))

BOOT=('<script>window.__WT_USER__=%s;window.__WT_STATE__=%s;(function(){var cache=Object.assign({},window.__WT_STATE__||{});'
 'function save(k,v){fetch("/api/state?key="+encodeURIComponent(k),{method:"POST",body:v}).catch(function(){});}'
 'var shim={getItem:function(k){return Object.prototype.hasOwnProperty.call(cache,k)?cache[k]:null;},'
 'setItem:function(k,v){cache[k]=String(v);save(k,String(v));},'
 'removeItem:function(k){delete cache[k];fetch("/api/state?key="+encodeURIComponent(k),{method:"DELETE"}).catch(function(){});},'
 'clear:function(){Object.keys(cache).forEach(function(k){delete cache[k];});fetch("/api/state",{method:"DELETE"}).catch(function(){});},'
 'key:function(i){return Object.keys(cache)[i]||null;}};'
 'try{Object.defineProperty(shim,"length",{get:function(){return Object.keys(cache).length;}});}catch(e){}'
 'try{Object.defineProperty(window,"localStorage",{configurable:true,value:shim});}catch(e){try{window.localStorage=shim;}catch(_){}}'
 '})();</script>')

class H(BaseHTTPRequestHandler):
    def _send(self,code,body=b'',ctype='application/json; charset=utf-8',extra=None):
        if isinstance(body,str): body=body.encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type',ctype)
        self.send_header('Content-Length',str(len(body)))
        for k,v in (extra or []): self.send_header(k,v)
        self.end_headers()
        if body: self.wfile.write(body)
    def _json(self,code,obj,extra=None):
        self._send(code,json.dumps(obj,ensure_ascii=False),'application/json; charset=utf-8',extra)
    def _cookie(self,name):
        for part in self.headers.get('Cookie','').split(';'):
            k,_,v=part.strip().partition('=')
            if k==name: return v
        return ''
    def _user(self):
        return parse_token(self._cookie(COOKIE))
    def _body(self):
        n=int(self.headers.get('Content-Length','0') or 0)
        return self.rfile.read(n).decode('utf-8') if n else ''
    def _bjson(self):
        try: return json.loads(self._body() or '{}')
        except Exception: return {}

    def do_GET(self):
        u=urlparse(self.path); path=u.path
        if path.startswith('/assets/'):
            rel=path[8:]
            if ('..' in rel) or (not re.match(r'^(js|css)/[A-Za-z0-9_.\-]+\.(js|css)$', rel)):
                return self._send(404,'not found','text/plain; charset=utf-8')
            fp=os.path.join(BASE,'src',rel)
            if not os.path.isfile(fp): return self._send(404,'not found','text/plain; charset=utf-8')
            ct='text/javascript; charset=utf-8' if rel.endswith('.js') else 'text/css; charset=utf-8'
            try: body=open(fp,encoding='utf-8').read()
            except Exception as e: return self._send(500,str(e),'text/plain; charset=utf-8')
            return self._send(200,body,ct,extra=[('Cache-Control','no-store')])
        if path=='/login':
            try: html=open(LOGIN_TPL,encoding='utf-8').read()
            except Exception as e: return self._send(500,str(e),'text/plain; charset=utf-8')
            return self._send(200,html,'text/html; charset=utf-8')
        if path in ('/','/index.html'):
            user=self._user()
            if not user:
                return self._send(302,'', 'text/plain', extra=[('Location','/login')])
            try: html=open(TEMPLATE,encoding='utf-8').read()
            except Exception as e: return self._send(500,str(e),'text/plain; charset=utf-8')
            html=html.replace('<!--WT_BOOT-->', BOOT % (json.dumps(user,ensure_ascii=False), json.dumps(jread(DATA_FILE,{}),ensure_ascii=False)), 1)
            return self._send(200,html,'text/html; charset=utf-8',extra=[('Cache-Control','no-store, no-cache, must-revalidate'),('Pragma','no-cache')])
        if path=='/api/health': return self._json(200,{'ok':True})
        if path=='/api/line/status':
            if not self._user(): return self._json(401,{'error':'unauthorized'})
            cfg=get_config(); tok=(cfg.get('line_token') or '')
            return self._json(200,{'configured':bool(tok),'token_tail':(tok[-4:] if tok else ''),'manager':bool(cfg.get('line_manager_id')),'group':bool(cfg.get('line_group_id')),'auto':bool(cfg.get('line_auto'))})
        if path=='/api/data-meta':
            user=self._user()
            if not user: return self._json(401,{'error':'unauthorized'})
            cfg=get_config()
            return self._json(200,{'configured':bool(cfg.get('data_csv_url')),'data_url':(cfg.get('data_csv_url','') if is_admin(user) else '')})
        if path=='/api/meta':
            src=user_source(); out={'source':src,'sheet_configured':bool(get_config().get('users_csv_url')),'count':len(get_users())}
            if src=='demo':
                out['demo_users']=[{'name':x['name'],'code':x['code'],'role':x['role']} for x in get_users()]
            return self._json(200,out)
        if path=='/api/session':
            user=self._user()
            return self._json(200,{'user':user}) if user else self._json(401,{'error':'unauthorized'})
        if path=='/api/users':
            user=self._user()
            if not user: return self._json(401,{'error':'unauthorized'})
            users=[{'name':x.get('name',''),'team':x.get('team',''),'role':x.get('role',''),'capacity':x.get('capacity',''),'email':x.get('email','')} for x in get_users()]
            adm=is_admin(user)
            out={'users':users,'source':user_source(),'is_admin':adm}
            if adm: out['sheet_url']=get_config().get('users_csv_url','')
            return self._json(200,out)
        if path=='/api/state':
            if not self._user(): return self._json(401,{'error':'unauthorized'})
            return self._json(200,jread(DATA_FILE,{}))
        return self._json(404,{'error':'not found'})

    def do_POST(self):
        u=urlparse(self.path); path=u.path
        if path=='/api/login':
            b=self._bjson(); usr=authenticate(b.get('name'),b.get('code'))
            if not usr: return self._json(401,{'ok':False,'error':'ไม่พบชื่อผู้ใช้ หรือรหัสไม่ถูกต้อง'})
            tok=make_token(usr)
            ck='%s=%s; Path=/; HttpOnly; SameSite=Lax; Max-Age=%d'%(COOKIE,tok,TTL)
            return self._json(200,{'ok':True,'user':{'name':usr['name'],'team':usr.get('team',''),'role':usr.get('role','')}},extra=[('Set-Cookie',ck)])
        if path=='/api/logout':
            ck='%s=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'%COOKIE
            return self._json(200,{'ok':True},extra=[('Set-Cookie',ck)])
        if path=='/api/refresh-users':
            if not self._user(): return self._json(401,{'ok':False,'error':'unauthorized'})
            ok,err,cnt=refresh_users()
            return self._json(200 if ok else 400,{'ok':ok,'error':err,'count':cnt})
        if path=='/api/config':
            if not self._user(): return self._json(401,{'ok':False,'error':'unauthorized'})
            b=self._bjson(); cfg=get_config()
            cfg['users_csv_url']=(b.get('users_csv_url') or '').strip(); save_config(cfg)
            ok,err,cnt=refresh_users()
            return self._json(200 if ok else 400,{'ok':ok,'error':err,'count':cnt})
        if path=='/api/preview-data':
            if not self._user(): return self._json(401,{'ok':False,'error':'unauthorized'})
            b=self._bjson(); url=(b.get('url') or get_config().get('data_csv_url','')).strip()
            if not url: return self._json(400,{'ok':False,'error':'ยังไม่ได้ระบุลิงก์'})
            mode=b.get('mode')
            try:
                if mode in ('internal','external'): mapped,_tab=fetch_media_tab(url,mode)
                else: mapped=map_plan_rows(fetch_csv(url))
            except Exception as e: return self._json(400,{'ok':False,'error':'ดึงข้อมูลไม่สำเร็จ: %s'%e})
            if not mapped: return self._json(400,{'ok':False,'error':'ไม่พบข้อมูลในชีต/แท็บ'})
            prev=[]
            for m in mapped[:500]:
                mt=m.get('_meta',{})
                prev.append({'date':m.get('publish',''),'title':m.get('title',''),'project':m.get('project',''),'status':m.get('status',''),'kind':m.get('kind',''),'comm':m.get('comm',''),'channels':mt.get('channels',''),'formats':mt.get('formats',''),'time':mt.get('time',''),'warn':m.get('_warn',[])})
            nwarn=sum(1 for m in mapped if m.get('_warn'))
            nnodate=sum(1 for m in mapped if not m.get('publish'))
            return self._json(200,{'ok':True,'count':len(mapped),'warn':nwarn,'no_date':nnodate,'rows':prev})
        if path=='/api/raw-sheet':
            if not self._user(): return self._json(401,{'ok':False,'error':'unauthorized'})
            b=self._bjson(); url=(b.get('url') or '').strip()
            if not url: return self._json(400,{'ok':False,'error':'ยังไม่ได้ระบุลิงก์'})
            mode=(b.get('mode') or '').strip(); rows=None
            if mode in ('internal','external'):
                sid=extract_sheet_id(url); cands=INTERNAL_TABS if mode=='internal' else EXTERNAL_TABS
                for tab in cands:
                    try: rr=gviz_csv(sid,tab)
                    except Exception: continue
                    if rr and raw_tab_ok(rr,mode): rows=rr; break
            if rows is None:
                try:
                    rows=fetch_csv(url)
                except Exception as e:
                    msg=str(e)
                    if any(c in msg for c in ('404','403','401')):
                        return self._json(400,{'ok':False,'error':'เข้าถึงชีตไม่ได้ — โปรดแชร์แบบ ทุกคนที่มีลิงก์ดูได้'})
                    return self._json(400,{'ok':False,'error':'ดึงข้อมูลไม่สำเร็จ: %s'%e})
            if not rows: return self._json(400,{'ok':False,'error':'ไม่พบข้อมูลในชีต'})
            headers=[(c or '').strip() for c in rows[0]]
            data=[r for r in rows[1:] if any((c or '').strip() for c in r)]
            total=len(data)
            return self._json(200,{'ok':True,'headers':headers,'rows':data[:1000],'total':total})
        if path=='/api/line/config':
            if not self._user(): return self._json(401,{'ok':False,'error':'unauthorized'})
            b=self._bjson(); cfg=get_config()
            if 'token' in b and (b.get('token') or '').strip(): cfg['line_token']=b['token'].strip()
            if 'manager_id' in b: cfg['line_manager_id']=(b.get('manager_id') or '').strip()
            if 'group_id' in b: cfg['line_group_id']=(b.get('group_id') or '').strip()
            if 'auto' in b: cfg['line_auto']=bool(b.get('auto'))
            if b.get('clear_token'): cfg['line_token']=''
            save_config(cfg)
            return self._json(200,{'ok':True})
        if path=='/api/line/notify-quota':
            if not self._user(): return self._json(401,{'ok':False,'error':'unauthorized'})
            import datetime; cfg=get_config()
            if not cfg.get('line_auto'): return self._json(200,{'ok':True,'skipped':'auto-off','sent':0})
            b=self._bjson(); ym=(b.get('ym') or ''); items=b.get('items') or []
            today=datetime.date.today().isoformat(); sent=cfg.get('line_sent') or {}
            tosend=[it for it in items if not sent.get(ym+'|'+str(it.get('dept',''))+'|'+today)]
            if not tosend: return self._json(200,{'ok':True,'sent':0})
            lines=['• '+str(it.get('dept',''))+' '+str(it.get('count'))+'/'+str(it.get('qm'))+' ฉบับ' for it in tosend]
            text='⚡ [อัตโนมัติ] แจ้งเตือนด่วน · สถิติหน่วยงาน\nเกินโควตา:\n'+'\n'.join(lines)+'\n\nโปรดตรวจสอบใน Work Tracker'
            ok,res=line_send_targets(text,['manager','group'])
            if ok:
                for it in tosend: sent[ym+'|'+str(it.get('dept',''))+'|'+today]=today
                sent={k:v for k,v in sent.items() if v==today}
                cfg['line_sent']=sent; save_config(cfg)
            return self._json(200,{'ok':ok,'sent':(len(tosend) if ok else 0),'results':res})
        if path=='/api/line/send':
            if not self._user(): return self._json(401,{'ok':False,'error':'unauthorized'})
            b=self._bjson(); text=(b.get('text') or '').strip()
            targets=b.get('targets') or ['manager','group']
            if not text: return self._json(400,{'ok':False,'error':'ไม่มีข้อความ'})
            ok,res=line_send_targets(text,targets)
            return self._json(200,{'ok':ok,'results':res})
        if path=='/api/import-data':
            if not self._user(): return self._json(401,{'ok':False,'error':'unauthorized'})
            b=self._bjson(); ok,err,cnt=import_data(b.get('url'), b.get('mode'))
            return self._json(200 if ok else 400,{'ok':ok,'error':err,'count':cnt})
        if path=='/api/state':
            if not self._user(): return self._json(401,{'error':'unauthorized'})
            key=(parse_qs(u.query).get('key') or [None])[0]
            if not key: return self._json(400,{'error':'key required'})
            with STATE_LOCK:
                d=jread(DATA_FILE,{}); d[key]=self._body(); jwrite(DATA_FILE,d)
            return self._json(200,{'ok':True})
        return self._json(404,{'error':'not found'})

    def do_DELETE(self):
        u=urlparse(self.path)
        if u.path=='/api/state':
            if not self._user(): return self._json(401,{'error':'unauthorized'})
            key=(parse_qs(u.query).get('key') or [None])[0]
            with STATE_LOCK:
                d=jread(DATA_FILE,{})
                if key: d.pop(key,None)
                else: d={}
                jwrite(DATA_FILE,d)
            return self._json(200,{'ok':True})
        return self._json(404,{'error':'not found'})
    def log_message(self,*a): pass

if __name__=='__main__':
    get_config(); 
    if not os.path.exists(USERS_FILE): jwrite(USERS_FILE, DEMO_USERS)
    ThreadingHTTPServer((HOST,PORT),H).serve_forever()
