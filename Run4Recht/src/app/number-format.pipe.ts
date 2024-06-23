import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberFormat'
})
export class NumberFormatPipe implements PipeTransform {

  transform(value: number, ...args: unknown[]): string {
    return value.toLocaleString('de-DE'); // Utilise la locale allemande pour le formatage
  }

}
