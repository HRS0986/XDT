import { AbstractControl, ValidatorFn } from '@angular/forms';

export function urlValidator(): ValidatorFn {
  return (url: AbstractControl): { [key: string]: any } | null => {
    let forbidden = true;
    if (url.value.includes('https://x265lk.com/movies/')) {
      forbidden = false;
    } else if (url.value.includes('https://x265lk.com/tvshows/')) {
      forbidden = false;
    } else if (url.value.includes('https://ceylonstream.com/movies/')) {
      forbidden = false;
    } else if (url.value.includes('https://ceylonstream.com/tvshows/')) {
      forbidden = false;
    }
    return forbidden ? { forbiddenName: { value: url.value } } : null;
  };
}
