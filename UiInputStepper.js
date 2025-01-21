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
  static delayMultipler = 0.98

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
   * @param {HTMLElement} [target=window] 
   */
  static addEventListener(target=window){
    target.addEventListener('pointerdown',this.onpointerdown)
    target.addEventListener('input',this.oninput)
  }

  /**
   * 이벤트 제거
   *
   * @static
   * @param {HTMLElement} [target=window] 
   */
  static removeEventListener(target=window){
    target.removeEventListener('pointerdown',this.onpointerdown)
    target.removeEventListener('input',this.oninput)
  }

  /**
   * 단계값 증가
   *
   * @static
   * @param {HTMLInputElement} input 
   * @param {string} stepper step type up/down/none
   * @param {Event} [event=null] relative event
   */
  static step(wrap,input,stepper,event=null){
    switch(stepper){
      case 'up':input.stepUp();break;
      case 'down':input.stepDown();break;
      case 'none':break;
      default: throw new Error(`Unsupported stepper. (${stepper})`);
    }
    // const wrap = input.closest('.ui-input-stepper');
    if(wrap.classList.contains('data-value')){
      if(wrap.oninput){
        if(event===null || event.type!='input'){ 
          const fakeEvent = {
            type: 'input',
            target: input,
            timeStamp: Date.now(),
          }
          wrap.oninput(fakeEvent) 
        }
      }else{
        wrap.dataset.value = input.value;
      }
    }
  }
  static currentDelay = 200;
  static tm = null;
  static setTimeout(wrap,input,stepper,event){
    this.tm = setTimeout(() => {
      this.step(wrap,input,stepper,event);
      this.setTimeout(wrap,input,stepper,event);
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
    const target = event.target;
    const wrap = target.closest('.ui-input-stepper')
    if(!wrap){ return;}
    const input = wrap.querySelector('input');
    if(!input){ return; }
    if(!target.dataset.stepper){ return; }
    const stepper = target.dataset.stepper
    
    this.step(wrap,input,stepper,event)
    this.currentDelay = parseFloat(wrap.dataset.firstDelay??this.firstDelay);
    this.setTimeout(wrap,input,stepper,event)
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
    const target = event.target;
    const wrap = target.closest('.ui-input-stepper')
    if(!wrap){ return;}
    const input = wrap.querySelector('input');
    if(!input){ return; }
    this.step(wrap,input,'none',null)
  }


  /**
   * initialize data-value attribute
   *
   * @static
   */
  static initDataValue(){
    window.document.querySelectorAll('.ui-input-stepper').forEach((wrap)=>{
      const input = wrap.querySelector('input')
      this.step(wrap,input,'none',null)
    })
  }

  
}