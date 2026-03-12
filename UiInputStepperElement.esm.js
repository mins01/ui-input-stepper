export default 
class UiInputStepperElement extends HTMLElement  {
  
  static firstDelay = 200; // 시작 딜레이
  static delayMultiplier = 0.96 // 변화량
  static minDelay = 5; //최소 딜레이
  static maxDelay = 1000; //최대 딜레이

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

    this.syncValue();

    this.addEventListener('pointerdown',this.pointerdownHandler)
    this.addEventListener('pointerup',this.pointerupHandler)
    this.addEventListener('pointercancel',this.pointerupHandler)
    this.addEventListener('input',this.inputeventHandler)
    this.addEventListener('change',this.inputeventHandler)
  }

  definedName = 'ui-input-stepper'
  static defineCustomElement(name='ui-input-stepper'){
      if(!globalThis.window){return;}
      if(!customElements.get(name)){
        this.definedName = name;
        customElements.define(name, this);
        console.debug('defineCustomElement',name);
      }
  }

  connectedCallback() {
    //  console.log("<div is='ui-input-stepper-wrapper'> attached.");
    this.syncValue();
  }
  valueAtDown = null;
  pointerdownHandler(event){
    const target = event.target.closest('[data-action]');
    if(!target) return;
    this.clearValueElements();
    this.valueAtDown = this.value
    if(target.dataset?.action){
      this.stopRepeat()
      target.setPointerCapture(event.pointerId); // 포인터 캡처 시작
      this.delay = this.firstDelay;
      const v = parseInt(target.dataset?.stepIncrement,10); // 증가 값이 아니라 step 횟수다
      const stepIncrement = Number.isFinite(v) ? v : 1;
      if(target.dataset?.action=='up'){
        this.repeatStepUp(stepIncrement)
      }
      if(target.dataset?.action=='down'){
        this.repeatStepDown(stepIncrement)
      }
    }
  }
  pointerupHandler(event){
    const target = event.target.closest('[data-action]');
    if(!target) return;
    if(target.hasPointerCapture(event.pointerId)) { 
      target.releasePointerCapture(event.pointerId); 
      this.stopRepeat()
      this.clearValueElements();
      if(this.valueAtDown !== this.value){ this.valueInput.dispatchEvent(new Event('change',{bubbles:true,cancelable:false})); }
      this.valueAtDown = null;
    }
  }

  inputeventHandler(event){
    this.syncValue();
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
    return this.valueInput?.value;
  }
  set value(v){
    if(this.valueInput) this.valueInput.value = v;
    this.syncValue();
  }

  // with input, change evenot
  setValue(v){
    const before = this.value
    this.value = v;

    if(before !== String(v)){
      this.valueInput.dispatchEvent(new Event('input',{bubbles:true,cancelable:false})); 
      this.valueInput.dispatchEvent(new Event('change',{bubbles:true,cancelable:false})); 
    }
  }
  


  repeatStepUp(stepIncrement=1){
    const before = this.value
    this.stepUp(stepIncrement);
    this.#tmId = setTimeout(()=>{ this.repeatStepUp(stepIncrement); },this.delay)
    this.delay = Math.min(Math.max(this.delay * this.delayMultiplier, this.minDelay),this.maxDelay);
    if(before !== this.value){ this.valueInput.dispatchEvent(new Event('input',{bubbles:true,cancelable:false})); }
  }
  repeatStepDown(stepIncrement=1){
    const before = this.value    
    this.stepDown(stepIncrement);
    this.#tmId = setTimeout(()=>{ this.repeatStepDown(stepIncrement); },this.delay)
    this.delay = Math.min(Math.max(this.delay * this.delayMultiplier, this.minDelay),this.maxDelay);
    if(before !== this.value){ this.valueInput.dispatchEvent(new Event('input',{bubbles:true,cancelable:false})); }
  }
  stopRepeat(){
    if(this.#tmId){clearTimeout(this.#tmId); this.#tmId = null;}
  }
  stepUp(v){ 
    this?.valueInput?.stepUp(v); 
    this.syncValue();
  }
  stepDown(v){ 
    this?.valueInput?.stepDown(v); 
    this.syncValue();
  }


  static syncValue(element){
    element.closest(this.definedName)?.syncValue();
  }

  syncValueScheduled = false;
  syncValue(){
    if(this.syncValueScheduled) return;

    this.syncValueScheduled = true;

    queueMicrotask(()=>{
      this.syncValueScheduled = false;
      this.syncValueOutput();
    });
  }
  syncValueOutput(){
    if(this.valueOutput) this.valueOutput.textContent = this.formattedOutput(this.value);    
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
    else if (name === "formatted-output") { this.formattedOutput = (value)=>newValue.replace('{value}',value) }
  }
}