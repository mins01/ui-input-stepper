class UiInputStepperWrapper extends HTMLElement  {
  
  static firstDelay = 200; // 시작 딜레이
  static delayMultiplier = 0.96 // 변화량
  static minDelay = 5; //최소 딜레이
  static maxDelay = 1000; //최소 딜레이

  #tmId = null;
  #valueInput = null;
  #valueOutput = null;
  constructor() {
    super();
    this.firstDelay = this.constructor.firstDelay
    this.delayMultiplier = this.constructor.delayMultiplier
    this.minDelay = this.constructor.minDelay
    this.maxDelay = this.constructor.maxDelay
    this.delay = this.firstDelay;
    this.#tmId = null;
    this.#valueInput = null;
    this.#valueOutput = null;

    this.sync();

    this.addEventListener('pointerdown',this.pointerdownHandler)
    this.addEventListener('pointerup',this.pointerupHandler)
    this.addEventListener('input',()=>{ this.sync() })
  }

  static defineCustomElement(name='ui-input-stepper-wrapper'){
      if(!globalThis.window){return;}
      window.customElements.define(name, this);
      console.debug('defineCustomElement',name);
  }

  // connectedCallback() {
  //  console.log("<div is='ui-input-stepper-wrapper'> attached.");
  // }
  pointerdownHandler(event){
    const target = event.target;
    this.clearValueElements();
    if(target.dataset?.action=='up'){
      this.setPointerCapture(event.pointerId); // 포인터 캡처 시작
      this.stopRepeat()
      this.delay = this.firstDelay;
      const stepIncrement = parseInt(target.dataset?.stepIncrement??'1',10);
      this.repeatStepUp(stepIncrement)
    }
    if(target.dataset?.action=='down'){
      this.setPointerCapture(event.pointerId); // 포인터 캡처 시작
      this.stopRepeat()
      this.delay = this.firstDelay;
      const stepIncrement = parseInt(target.dataset?.stepIncrement??'1');
      this.repeatStepDown(stepIncrement)
    }
  }
  pointerupHandler(event){
    this.releasePointerCapture(event.pointerId); // 포인터 캡처 시작
    this.stopRepeat()
    this.clearValueElements();
  }

  clearValueElements(){
    this.clearValueinput()
    this.clearValueOutput()
  }
  clearValueinput(){
    this.#valueInput = null;
  }
  clearValueOutput(){
    this.#valueOutput = null;
  }
  get valueInput(){
     //속도를 위한 캐싱
    if(!this.#valueInput){ this.#valueInput = this.querySelector('input:where([type="range"],[type="number"])'); }
    return this.#valueInput;
  }

  get valueOutput(){
     //속도를 위한 캐싱
    if(!this.#valueOutput){ this.#valueOutput = this.querySelector('output'); }
    return this.#valueOutput;
  }

  get value(){
    return this?.valueInput?.value;
  }
  set value(v){
    if(this?.valueInput) this.valueInput.value = v;
    this.sync();
  }


  repeatStepUp(stepIncrement=1){
    this.stepUp(stepIncrement);
    this.#tmId = setTimeout(()=>{ this.repeatStepUp(stepIncrement); },this.delay)
    this.delay = Math.min(Math.max(this.delay * this.delayMultiplier, this.minDelay),this.maxDelay);
  }
  repeatStepDown(stepIncrement=1){
    this.stepDown(stepIncrement);
    this.#tmId = setTimeout(()=>{ this.repeatStepDown(stepIncrement); },this.delay)
    this.delay = Math.min(Math.max(this.delay * this.delayMultiplier, this.minDelay),this.maxDelay);
  }
  stopRepeat(){
    if(this.#tmId){clearTimeout(this.#tmId); this.#tmId = null;}
  }
  stepUp(v){ 
    this?.valueInput?.stepUp(v); 
    this.sync();
  }
  stepDown(v){ 
    this?.valueInput?.stepDown(v); 
    this.sync();
  }
  sync(){
    this.syncOutput();
  }
  syncOutput(){
    if(this.valueOutput) this.valueOutput.textContent = this.formattedOutput(this?.valueInput?.value);
  }

  // 이거 재선언해서 사용하자.
  formattedOutput(value){
    return value;
  }
  
  

  // 필요시 attribute 변경 감지
  static get observedAttributes() {
    return [
      "first-delay",
      "delay-multiplier",
      "min-delay",
      "max-delay",
      "formatted-output",
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "first-delay") { this.firstDelay = parseFloat(newValue); }
    else if (name === "delay-multiplier") { this.delayMultiplier = parseFloat(newValue); }
    else if (name === "min-delay") { this.minDelay = parseFloat(newValue); }
    else if (name === "max-delay") { this.maxDelay = parseFloat(newValue); }
    else if (name === "formatted-output") { this.formattedOutput = new Function('value', newValue); this.sync(); }
  }
}