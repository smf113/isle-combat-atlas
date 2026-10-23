"""Real Chromium regression suite for actual HTML and JS. Install: pip install playwright; playwright install chromium."""
import json, subprocess, time
from pathlib import Path
from urllib.parse import quote
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
server=subprocess.Popen(['python','-m','http.server','8765','--bind','127.0.0.1','--directory',str(root/'site')],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
base='http://127.0.0.1:8765/'
try:
 time.sleep(1)
 with sync_playwright() as playwright:
  browser=playwright.chromium.launch(headless=True)
  page=browser.new_page(viewport={'width':1280,'height':850})
  errors=[];page.on('pageerror',lambda exc:errors.append(str(exc)))
  page.goto(base,wait_until='domcontentloaded')
  page.locator('[data-tab="growth"]').click()
  assert page.locator('#matchupSideA .matchup-invalid').count()==0
  page.locator('#matchupSideA [data-field="prime"]').check()
  page.locator('#matchupSideA [data-field="source"]').select_option('none')
  assert page.locator('#matchupSideA [data-field="prime"]').is_checked()
  page.locator('#matchupSideA [data-field="growth"]').fill('74')
  assert 'inactive' in page.locator('#matchupSideA').inner_text()
  page.locator('#matchupSideA [data-field="growth"]').fill('75')
  assert 'active now' in page.locator('#matchupSideA').inner_text()
  page.locator('#matchupSideA [data-field="prime"]').uncheck()
  page.locator('#matchupSideA [data-field="source"]').select_option('standard')
  page.locator('#matchupSideA [data-customize-standard]').click()
  assert page.locator('#matchupSideA select[data-slot="4"]').is_disabled()
  assert page.locator('#matchupSideA [data-clear-retained]').count()==1
  page.locator('#matchupSideA select[data-slot="3"]').select_option('Accelerated Prey Drive')
  page.locator('#matchupSideA [data-clear-retained]').click()
  assert page.locator('#matchupSideA select[data-slot="4"]').input_value()==''
  page.locator('#matchupSideA [data-field="prime"]').check()
  page.locator('#matchupSideA [data-field="sex"]').select_option('Female')
  page.locator('#matchupSideA select[data-slot="2"]').select_option('Parthenogenesis')
  page.locator('#matchupSideA [data-field="sex"]').select_option('Male')
  assert page.locator('#matchupSideA select[data-slot="2"]').input_value()=='Parthenogenesis'
  assert 'EXCLUDED' in page.locator('#matchupSideA select[data-slot="2"] option:checked').inner_text()
  page.locator('#matchupSideA select[data-slot="2"]').select_option('')
  state=page.evaluate('JSON.parse(localStorage.getItem("origin-matchup-calculator-v2"))')
  state['a']['manual'][1]='Restored unknown mutation'
  page.evaluate('(s)=>localStorage.setItem("origin-matchup-calculator-v2",JSON.stringify(s))',state)
  page.reload(wait_until='domcontentloaded');page.locator('[data-tab="growth"]').click()
  assert page.locator('#matchupSideA select[data-slot="2"]').input_value()=='Restored unknown mutation'
  assert 'EXCLUDED' in page.locator('#matchupSideA select[data-slot="2"] option:checked').inner_text()
  page.locator('#matchupSideA select[data-slot="2"]').select_option('')
  assert '50%' in page.locator('#matchupGrowthCurve').inner_text()
  assert page.locator('#matchupGrowthCurve .matchup-curve-row').count()==9
  assert page.locator('#matchupResult .matchup-spectrum').inner_text().index('A advantage') < page.locator('#matchupResult .matchup-spectrum').inner_text().index('B advantage')
  lives=[{'prime':False,'picks':['','','','']} for _ in range(5)];lives[0]['picks'][0]='Hemomania'
  sample={'v':1,'dino':'Allosaurus','sex':'Male','generation':1.5,'contexts':[],'lives':lives}
  page.goto(base+'#lineage='+quote(json.dumps(sample),safe=''),wait_until='domcontentloaded')
  page.locator('[data-tab="growth"]').click()
  page.locator('#matchupSideA [data-field="source"]').select_option('lineage')
  page.locator('#matchupSideA [data-import-planner]').click()
  assert 'Allosaurus' in page.locator('#matchupSideA').inner_text()
  sample['dino']='Omniraptor';sample['generation']=3.5
  page.evaluate('(h)=>location.hash=h','#lineage='+quote(json.dumps(sample),safe=''))
  page.locator('[data-tab="growth"]').click()
  page.locator('#matchupSideB [data-field="source"]').select_option('lineage')
  page.locator('#matchupSideB [data-import-planner]').click()
  assert 'Allosaurus' in page.locator('#matchupSideA').inner_text()
  assert 'Omniraptor' in page.locator('#matchupSideB').inner_text()
  assert 'Life 3' in page.locator('#matchupSideB').inner_text()
  assert not errors,errors
  page.set_viewport_size({'width':390,'height':844})
  page.locator('#siteVersion').click()
  assert 'Version 1.0.1' in page.locator('body').inner_text()
  print('Chromium browser smoke: PASS')
  browser.close()
finally:
 server.terminate();server.wait(timeout=5)
