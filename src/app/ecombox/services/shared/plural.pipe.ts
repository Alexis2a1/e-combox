import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'plural',
})
export class PluralPipe implements PipeTransform {

  transform(text: string, nb: number): any {
    let pluralText: string = '';
    if (nb > 1) {
      const words = text.split(' ');
      words.forEach(word => {
        pluralText += word + 's ';
      });
    } else {
      pluralText = text;
    }
    return pluralText;
  }

}
