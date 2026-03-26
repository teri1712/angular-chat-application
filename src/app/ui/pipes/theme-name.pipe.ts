import {Pipe, PipeTransform} from '@angular/core';

/**
 * Converts a kebab-case theme slug into a title-cased display name.
 * e.g. "silver-mist"  →  "Silver Mist"
 *      "golden-hour"  →  "Golden Hour"
 */
@Pipe({
      name: 'themeName',
      standalone: true
})
export class ThemeNamePipe implements PipeTransform {
      transform(value: string | null | undefined): string {
            if (!value) return '';
            return value
                  .split('-')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ');
      }
}

