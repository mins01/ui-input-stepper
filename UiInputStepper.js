class UiInputStepper{
  /**
   * setTimeout delay at first
   *
   * @static
   * @type {number}
   */
  static firstDelay = 200 // ms
    
  /**
   * delay multipler
   * 1 does not change the delay time.
   *
   * @static
   * @type {number}
   */
  static delayMultipler = 0.96

  /**
   * setTimeout min delay
   *
   * @static
   * @type {number}
   */
  static minDelay = 5; // ms

  /**
   * 이벤트 등록
   *
   * @static
   * @param {?HTMLElement} [target=window] 
   */
  static addEventListener(target=window){
    target.addEventListener('pointerdown',this.onpointerdown)
    target.addEventListener('input',this.oninput)
  }

  /**
   * 이벤트 제거
   *
   * @static
   * @param {?HTMLElement} [target=window] 
   */
  static removeEventListener(target=window){
    target.removeEventListener('pointerdown',this.onpointerdown)
    target.removeEventListener('input',this.oninput)
  }

  /**
   * step up/down
   *
   * @static
   * @param {HTMLInputElement} input 
   * @param {string} stepper step type up/down/none
   */
  static step(input,stepper){
    switch(stepper){
      case 'up':input.stepUp();break;
      case 'down':input.stepDown();break;
      case 'none':break;
      default: throw new Error(`Unsupported stepper. (${stepper})`);
    }
  }

  /**
   * sync data-value attrubite
   *
   * @static
   * @param {HTMLInputElement} input 
   * @param {?HTMLElement} [wrap=null] 없으면 가까운 것을 찾아 사용함
   */
  static syncDataValue(input,wrap=null){
    if(wrap===null){
      wrap = input.closest('.ui-input-stepper');
    }
    if(wrap){
      

      if(wrap.classList.contains('ui-input-stepper-data-value')){ 
        const valueMultipler = wrap.dataset.valueMultipler??'1';
        const valueToFixed = wrap.dataset.valueToFixed;
        let value = input.valueAsNumber;
        if(valueMultipler!==1){ value *=parseFloat(valueMultipler); }
        if(valueToFixed!==undefined){ value = value.toFixed(parseInt(valueToFixed)) }
        else{value = value.toString();}

        wrap.dataset.value = value; 
      }
      wrap.querySelectorAll('.ui-input-stepper-data-value').forEach(el=>{ 
        const valueMultipler = el.dataset.valueMultipler??'1';
        const valueToFixed = el.dataset.valueToFixed;
        let value = input.valueAsNumber;
        if(valueMultipler!==1){ value *=parseFloat(valueMultipler); }
        if(valueToFixed!==undefined){ value = value.toFixed(parseInt(valueToFixed)) }
        else{value = value.toString();}

        el.dataset.value = value; 
      })
    }
  }
  
  /**
   * current delay time. (ms)
   *
   * @static
   * @type {number}
   */
  static currentDelay = 200;

  /**
   * tm = setTimeout()
   *
   * @static
   * @type {?number}
   */
  static tm = null;

  /**
   * Repeated Call
   *
   * @static
   * @param {HTMLElement} wrap 
   * @param {HTMLInputElement} input 
   * @param {string} stepper step type up/down/none
   * @param {Event} [event=null] relative event
   */
  static setTimeout(input,stepper,wrap=null){
    if(this.tm){ clearTimeout(this.tm); }
    this.tm = setTimeout(() => {
      this.step(input,stepper);
      this.dispatchInput(input);
      this.setTimeout(input,stepper,wrap);
    }, this.currentDelay);
    
    // const wrap = input.closest('.ui-input-stepper');  
    const minDelay = parseFloat(wrap.dataset.minDelay??this.minDelay);   
    if(this.currentDelay > minDelay){
      this.currentDelay = Math.max(minDelay,this.currentDelay * parseFloat(wrap.dataset.delayMultipler??this.delayMultipler));   
    }
    
  } 
  
  /**
   * onpointerdown process method
   *
   * @param {Event} event 
   */
  static onpointerdown = (event)=>{
    const btn = event.target;
    if(!btn.classList.contains('btn-stepper')){ return; }
    const wrap = btn.closest('.ui-input-stepper')
    if(!wrap){ return;}
    const input = wrap.querySelector('input:where([type="number"],[type="range"])')
    if(!input){ return; }
    if(!btn.dataset.stepper){ return; }
    const stepper = btn.dataset.stepper
    
    this.step(input,stepper)
    this.dispatchInput(input);
    this.currentDelay = parseFloat(wrap.dataset.firstDelay??this.firstDelay);
    this.setTimeout(input,stepper,wrap)
    window.addEventListener('pointerup',this.onpointerup,{once:true});
  }
  
  /**
   * onpointerup process method
   *
   * @param {Event} event 
   */
  static onpointerup = (event)=>{
    if(this.tm){clearTimeout(this.tm);}
  }

  /**
   * oninput process method
   *
   * @param {Event} event 
   */
  static oninput = (event)=>{
    const input = event.target;
    if(!input?.stepUp){return;} //숫자관련 input인가?
    const wrap = input.closest('.ui-input-stepper')
    if(!wrap){ return;}
    this.syncDataValue(input,wrap)
  }

  /**
   * trigger input event
   *
   * @static
   * @param {HTMLInputElement} input 
   */
  static dispatchInput(input){
    input.dispatchEvent((new Event('input',{bubbles:true,cancelable:true})));
  }
      
  

  /**
   * initialize data-value attribute
   *
   * @static
   */
  static initDataValue(target=null){
    if(target===null){ target = window.document }
    target.querySelectorAll('.ui-input-stepper').forEach((wrap)=>{
      const input = wrap.querySelector('input:where([type="number"],[type="range"])')
      if(!input){ return; }
      this.syncDataValue(input,wrap)
    })
  }
  






  /**
   * Fill data-value from inputElement
   *
   * @deprecated
   * @alias syncDataValue
   * @static
   * @param {HTMLInputElement} input 
   */
  static dataValueFromInput(input){
    return this.syncDataValue(input);
  }

  
}