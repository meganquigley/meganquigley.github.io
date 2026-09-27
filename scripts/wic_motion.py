"""Persistent visual stages for the opening split, phone, and population zoom."""
from wic_vectors import external

def split_stage():
 family=external('s0','split-family')
 return '<div class="split-stage" aria-hidden="true"><svg class="timeline-fork" viewBox="0 0 1000 500" preserveAspectRatio="none"><path class="fork-stem" d="M500 20V115"/><path class="fork-line" d="M500 115C500 205 250 140 250 250M500 115C500 205 750 140 750 250" pathLength="1"/></svg><div class="universe universe-with">'+family+'<span class="universe-label">With WIC</span></div><div class="universe universe-without">'+family+'<span class="universe-label">Without WIC</span></div></div>'

def phone(messages):
 rows=''.join(f'<p class="phone-message {"mine" if who=="me" else "friend"}">{text}</p>' for who,text in messages)
 return '<div class="phone-conversation"><div class="phone-speaker"></div><p class="phone-contact">A friend</p><div class="phone-chat">'+rows+'</div><div class="phone-home"></div></div>'

def crowd():
 # 50 mother-child pairs = 100 people. Both people in 28 pairs are highlighted.
 # These paired illustrations do not assert that benefits always reach whole families.
 figures=[]
 for i in range(50):
  name='mother-baby' if i==22 else f'crowd-family-{i%12}'
  body=f'<use class="{"crowd-maya" if i==22 else "crowd-family-art"}" href="art/story-vectors.svg?v=families4#v-{name}" x="-26" y="-26" width="52" height="52"/>'
  figures.append(f'<g data-people="2" class="crowd-person {"receives" if i<28 else "unreached"} {"crowd-origin" if i==22 else ""}" transform="translate({(i%10)*86+63} {(i//10)*96+48})">{body}</g>')
 return '<div class="crowd-view"><svg viewBox="0 0 900 540" aria-label="Mothers with their young children: 100 people, with 56 highlighted to show roughly how many eligible people receive WIC"><g class="crowd-camera">'+''.join(figures)+'</g></svg><div class="crowd-stat"><strong>56.1%</strong><span>of eligible people receive WIC</span><small>United States · average month, 2023</small></div></div>'
