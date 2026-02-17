import {
  Component,
  ElementRef,
  ViewChild,
  forwardRef,
  AfterViewInit,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-signature-pad',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="signature-container">
      <label *ngIf="label">{{ label }}</label>
      <canvas
        #canvas
        (mousedown)="onMouseDown($event)"
        (mousemove)="onMouseMove($event)"
        (mouseup)="onMouseUp()"
        (mouseleave)="onMouseUp()"
        (touchstart)="onTouchStart($event)"
        (touchmove)="onTouchMove($event)"
        (touchend)="onMouseUp()"
        width="500"
        height="200"
      >
      </canvas>
      <div class="signature-actions">
        <button type="button" class="btn btn-sm btn-outline" (click)="clear()">
          Löschen
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .signature-container {
        margin: 8px 0;
      }
      canvas {
        border: 2px solid #ccc;
        border-radius: 6px;
        cursor: crosshair;
        width: 100%;
        max-width: 500px;
        height: 200px;
        touch-action: none;
        background: #fafafa;
      }
      .signature-actions {
        margin-top: 4px;
      }
      label {
        display: block;
        margin-bottom: 4px;
        font-weight: 500;
        font-size: 0.9rem;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SignaturePadComponent),
      multi: true,
    },
  ],
})
export class SignaturePadComponent
  implements AfterViewInit, ControlValueAccessor
{
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() label = '';

  private ctx!: CanvasRenderingContext2D;
  private drawing = false;
  private hasContent = false;

  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }

  private getPos(e: MouseEvent): { x: number; y: number } {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const scaleX = this.canvasRef.nativeElement.width / rect.width;
    const scaleY = this.canvasRef.nativeElement.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  onMouseDown(e: MouseEvent) {
    this.drawing = true;
    const pos = this.getPos(e);
    this.ctx.beginPath();
    this.ctx.moveTo(pos.x, pos.y);
  }

  onMouseMove(e: MouseEvent) {
    if (!this.drawing) return;
    const pos = this.getPos(e);
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();
    this.hasContent = true;
  }

  onMouseUp() {
    if (this.drawing) {
      this.drawing = false;
      this.emitValue();
    }
  }

  onTouchStart(e: TouchEvent) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    this.onMouseDown(mouseEvent);
  }

  onTouchMove(e: TouchEvent) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    this.onMouseMove(mouseEvent);
  }

  clear() {
    this.ctx.clearRect(
      0,
      0,
      this.canvasRef.nativeElement.width,
      this.canvasRef.nativeElement.height,
    );
    this.hasContent = false;
    this.onChange('');
  }

  private emitValue() {
    if (this.hasContent) {
      const data = this.canvasRef.nativeElement.toDataURL('image/png');
      this.onChange(data);
    }
    this.onTouched();
  }

  writeValue(val: string): void {
    if (!val) {
      setTimeout(() => this.clear(), 0);
    }
  }

  registerOnChange(fn: (val: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
