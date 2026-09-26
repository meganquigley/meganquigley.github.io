"""Persistent visual stages for the opening split, phone, and population zoom."""
from wic_vectors import external

def split_stage():
 family=external('s0','split-family')
 return '<div class="split-stage" aria-hidden="true"><svg class="timeline-fork" viewBox="0 0 1000 500" preserveAspectRatio="none"><path class="fork-stem" d="M500 20V115"/><path class="fork-line" d="M500 115C500 205 250 140 250 250M500 115C500 205 750 140 750 250" pathLength="1"/></svg><div class="universe universe-with">'+family+'<span class="universe-label">✓ With WIC</span></div><div class="universe universe-without">'+family+'<span class="universe-label">○ Without WIC</span></div></div>'

def phone(messages):
 rows=''.join(f'<p class="phone-message {"mine" if who=="me" else "friend"}">{text}</p>' for who,text in messages)
 return '<div class="phone-conversation"><div class="phone-speaker"></div><p class="phone-contact">A friend</p><div class="phone-chat">'+rows+'</div><div class="phone-home"></div></div>'

def crowd():
 # One mark is one person in a rounded group of 100; the statistic retains precision.
 skins=['#f4cdb6','#c99776','#815e4c','#e6b58d','#b68160'];hair=['#4a3b33','#30342e','#6b4935','#806844']
 figures=[]
 for i in range(100):
  row,col=divmod(i,10);x=col*86+63;y=row*49+30
  body=f'<path d="M-16 22q0-17 16-17 16 0 16 17Z" fill="currentColor"/><circle cy="-5" r="12" fill="{skins[i%5]}"/><path d="M-12-6q0-17 12-15 14-1 12 16-6-1-10-9-3 7-14 8Z" fill="{hair[i%4]}"/><path d="M-4-3h.1m8 0h.1" stroke="#293833" stroke-width="2.5" stroke-linecap="round"/>'
  # Keep one anchored person in the middle as the camera pulls back.
  figures.append(f'<g class="crowd-person {"receives" if i<56 else "unreached"} {"crowd-origin" if i==44 else ""}" transform="translate({x} {y})">{body}</g>')
 return '<div class="crowd-view"><svg viewBox="0 0 900 540" aria-label="About 56 of every 100 eligible people participate in WIC"><g class="crowd-camera">'+''.join(figures)+'</g></svg><div class="crowd-stat"><strong>56.1%</strong><span>of eligible people receive WIC</span><small>United States · average month, 2023</small></div></div>'
