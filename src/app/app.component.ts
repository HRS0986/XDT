import {Component} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {urlValidator} from './app.validators';
import {AutoCompleteResult, X265SearchResults, X265SearchResult} from './types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'SaveTV';
  status = '';
  docObject!: Document;
  showProgressBar = false;
  autoCompleteSearchResult: AutoCompleteResult[] = [];

  constructor(private http: HttpClient) {
  }

  urlForm = new FormGroup({
    url: new FormControl('', [Validators.required, urlValidator()]),
  });

  search(event: any): void {
    this.autoCompleteSearchResult = [];
    const searchTerm: string = event.target.value;
    const x265URL = `https://x265lk.com/wp-json/dooplay/search/?keyword=${searchTerm}&nonce=deec18d3b5`;
    const ceylonStreamURL = `https://ceylonstream.com/wp-json/dooplay/search/?keyword=${searchTerm}&nonce=58c229ef9e`;

    this.http.get<X265SearchResults>(x265URL).subscribe(
      data => this.addToAutoComplete(data, 'X265LK'),
      err => console.log(err)
    );

    this.http.get<X265SearchResults>(ceylonStreamURL).subscribe(
      data => this.addToAutoComplete(data, 'CeylonStream'),
      err => console.log(err)
    );
  }

  addToAutoComplete(data: X265SearchResults, siteName: 'X265LK' | 'CeylonStream'): void {
    for (const result in data) {
      const ceylonStreamResult: X265SearchResult = data[result];

      const autoCompleteResult: AutoCompleteResult = {
        title: ceylonStreamResult.title,
        url: ceylonStreamResult.url,
        imdb: ceylonStreamResult.extra.imdb,
        year: ceylonStreamResult.extra.date,
        img: ceylonStreamResult.img,
        site: siteName
      };
      this.autoCompleteSearchResult.push(autoCompleteResult);
    }
  }

  clickOnAutoComplete(url: string): void {
    this.urlForm.setValue({url});
    this.findLinks();
  }

  findLinks(): void {
    this.showProgressBar = true;
    const url: string = this.urlForm.getRawValue().url;

    if (url.includes('movies')) {
      this.status = 'movies';
    } else if (url.includes('tvshows')) {
      this.status = 'tvshows';
    }

    this.http.get(url, {responseType: 'text'}).subscribe(
      (data) => {
        this.docObject = new DOMParser().parseFromString(data, 'text/html');
        this.showProgressBar = false;
      },
      err => console.log(err)
    );
  }
}
