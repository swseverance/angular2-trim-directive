import {
  Directive, ElementRef, HostListener, Inject, Input, Optional,
  Renderer2
} from '@angular/core';
import { COMPOSITION_BUFFER_MODE, DefaultValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive( {
  selector : 'input[trim], textarea[trim]',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: InputTrimDirective, multi: true }]

} )
export class InputTrimDirective extends DefaultValueAccessor {

  @Input()
  set trim( value: 'input' | 'blur' ) {
    this._trim = value || 'input';
  }

  get trim() {
    return this._trim;
  }

  private _trim;

  /**
   * Keep the type of input element in a cache.
   *
   * @type {string}
   * @private
   */
  private _type: string = 'text';

  /**
   * Keep the value of input element in a cache.
   *
   * @type {string}
   * @private
   */
  private _value: string;

  // Source services to modify elements.
  private _sourceRenderer: Renderer2;
  private _sourceElementRef: ElementRef;

  @Input()
  set type( value: string ) {
    this._type = value || 'text';
  }

  // Get the element type
  get type(): string {
    return this._type;
  }

  /**
   * Get the cached value for comparison.
   *
   */
  get value() {
    return this._value;
  }

  /**
   * Set a new value to the field and model.
   *
   */
  set value( val: any ) {
    // update element
    this.writeValue( val );

    if (val !== this.value) {

      // Cache the new value first
      this._value = val;

      // update model
      this.onChange( val );

    }

  }

  /**
   * Updates the value on the blur event.
   */
  @HostListener( 'blur', ['$event.target.value'] )
  onBlur( value: string ): void {
    const trimmedValue = value.trim();

    // update value if only changed
    // FIX: https://github.com/anein/angular2-trim-directive/issues/17
    if (trimmedValue !== this.value) {
      this.value = trimmedValue;
    }

    this.onTouched();
  }

  /**
   * Updates the value on the input event.
   */
  @HostListener( 'input', ['$event.target.value'] )
  onInput( value: string ): void {
    if (this.trim !== 'input') return;

    // remove whitespace from start of string only
    this.value = value.replace(/^\s+/, '');
  }

  constructor( @Inject( Renderer2 ) renderer: Renderer2,
               @Inject( ElementRef ) elementRef: ElementRef,
               @Optional() @Inject( COMPOSITION_BUFFER_MODE ) compositionMode: boolean ) {
    super( renderer, elementRef, compositionMode );

    this._sourceRenderer = renderer;
    this._sourceElementRef = elementRef;
  }

  /**
   * Writes a new value to the element based on the type of input element.
   *
   * FIX: https://github.com/anein/angular2-trim-directive/issues/9
   *
   * @param {any} value - new value
   */
  public writeValue( value: any ): void {

    if (!this._value) {
      this._value = value;
    }

    this._sourceRenderer.setProperty( this._sourceElementRef.nativeElement, 'value', value );

    // a dirty trick (or magic) goes here:
    // it updates the element value if `setProperty` doesn't set it for some reason.
    if (this._type !== 'text') {
      this._sourceRenderer.setAttribute( this._sourceElementRef.nativeElement, 'value', value );
    }

  }

}
