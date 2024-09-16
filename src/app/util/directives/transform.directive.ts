import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[transform]',
  standalone: true
})
export class TransformDirective {
  constructor(private el: ElementRef) { }

  @Input() transform;

  @HostListener('keyup', ['$event']) onKeyUp(e) {
    if (this.transform === 'upper')
      e.target.value = e.target.value.toUpperCase();
    else if(this.transform === 'lower')
      e.target.value = e.target.value.toLowerCase();
    else
      e.target.value = e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1);
  }
}
