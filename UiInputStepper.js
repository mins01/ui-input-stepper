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
    target.addEventListener('change',this.onchange)
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
    target.removeEventListener('change',this.onchange)
  }

  /**
   * step up/down
   *
   * @static
   * @param {HTMLInputElement} input
   * @param {string} stepper step type up/down/none
   */
  static step(input,stepper){
    const brefore = input.valueAsNumber;
    switch(stepper){
      case 'up':input.stepUp();break;
      case 'down':input.stepDown();break;
      case 'none':break;
      default: throw new Error(`Unsupported stepper. (${stepper})`);
    }
    if(input.valueAsNumber!==brefore){
      this.dispatchInput(input);
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
        this.formatValue(input, wrap)
      }
      wrap.querySelectorAll('.ui-input-stepper-data-value').forEach(el=>{
        this.formatValue(input, el)
      })
    }
  }
  static formatValue(input, el){
    const valueMultipler = el.dataset.valueMultipler??'1';
    const valueToFixed = el.dataset.valueToFixed;
    let value = input.valueAsNumber;
    if(valueMultipler!=='1'){ value *=parseFloat(valueMultipler); }
    if(valueToFixed!==undefined){ value = value.toFixed(parseInt(valueToFixed)) }
    else{value = value.toString();}

    el.dataset.value = value;
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
  static startStepLoop(input,stepper,wrap=null){
    if(this.tm){ clearTimeout(this.tm); } // 동시 동작 막음!
    this.tm = setTimeout(() => {
      this.step(input,stepper);
      this.startStepLoop(input,stepper,wrap);
    }, this.currentDelay);

    // const wrap = input.closest('.ui-input-stepper');
    const v = parseFloat(wrap?.dataset?.minDelay);
    const minDelay = Number.isFinite(v) ? v : this.minDelay;
    if(this.currentDelay > minDelay){
      this.currentDelay = Math.max(minDelay,this.currentDelay * parseFloat(wrap.dataset.delayMultipler??this.delayMultipler));
    }

  }


  static valueAtDown = null
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
    this.valueAtDown = input.valueAsNumber;
    const stepper = btn.dataset.stepper
    this.step(input,stepper)
    this.currentDelay = parseFloat(wrap?.dataset?.firstDelay??this.firstDelay);
    this.startStepLoop(input,stepper,wrap)

    btn.setPointerCapture(event.pointerId);
    if (!btn.hasAttribute('data-bound')) {
      btn.setAttribute('data-bound','1');
      btn.addEventListener('pointerup',this.onpointerup);
      btn.addEventListener('pointercancel',this.onpointerup);
    }
  }

  /**
   * onpointerup process method
   *
   * @param {Event} event
   */
  static onpointerup = (event)=>{
    console.log('onpointerup',event.type);
    
    const btn = event.target;
    if(btn.hasPointerCapture(event.pointerId)){
      btn.releasePointerCapture(event.pointerId);
    }
    if(!btn.classList.contains('btn-stepper')){ return; }
    const wrap = btn.closest('.ui-input-stepper')
    if(!wrap){ return;}
    const input = wrap.querySelector('input:where([type="number"],[type="range"])')
    if(!input){ return; }

    if(this.tm){clearTimeout(this.tm);}

    if(this.valueAtDown !== input.valueAsNumber){
      this.dispatchChange(input);
    }
    this.valueAtDown = null;
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
   * Description placeholder
   *
   * @alias oninput
   * @param {Event} event
   */
  static onchange = (event)=>{
    this.oninput(event);
  }

  /**
   * trigger input event
   *
   * @static
   * @param {HTMLInputElement} input
   */
  static dispatchInput(input){
    input.dispatchEvent((new Event('input',{bubbles:true,cancelable:false})));
  }
  static dispatchChange(input){
    input.dispatchEvent((new Event('change',{bubbles:true,cancelable:false})));
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