import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { urlValidator } from './app.validators';
import { AutoCompleteResult, X265SearchResults, X265SearchResult } from './types';

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

  constructor(private http: HttpClient) {}

  urlForm = new FormGroup({
    url: new FormControl('', [Validators.required, urlValidator()]),
  });


  search(event: any): void {
    this.autoCompleteSearchResult = [];
    const searchTerm: string = event.target.value;
    const x265URL = `https://x265lk.com/wp-json/dooplay/search/?keyword=${searchTerm}&nonce=deec18d3b5`;
    const ceylonStreamURL = `https://ceylonstream.com/wp-json/dooplay/search/?keyword=${searchTerm}&nonce=58c229ef9e`;

    this.http.get<X265SearchResults>(x265URL).subscribe(
      data => {
        for (const result in data) {
          const x265Result: X265SearchResult = data[result];
          const autoCompleteResult: AutoCompleteResult = {
            title: x265Result.title,
            url: x265Result.url,
            imdb: x265Result.extra.imdb,
            year: x265Result.extra.date,
            img: x265Result.img,
            site: 'X265LK'
          };
          this.autoCompleteSearchResult.push(autoCompleteResult);
        }
      },
      err => console.log(err)
    );

    this.http.get<X265SearchResults>(ceylonStreamURL).subscribe(
      data => {
        for (const result in data) {
          const ceyloanStreamResult: X265SearchResult = data[result];
          const autoCompleteResult: AutoCompleteResult = {
            title: ceyloanStreamResult.title,
            url: ceyloanStreamResult.url,
            imdb: ceyloanStreamResult.extra.imdb,
            year: ceyloanStreamResult.extra.date,
            img: ceyloanStreamResult.img,
            site: 'CeylonStream'
          };
          this.autoCompleteSearchResult.push(autoCompleteResult);
        }
      },
      err => console.log(err)
    );
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

    this.http.get(url, { responseType: 'text' }).subscribe(
      (data) => {
        this.docObject = new DOMParser().parseFromString(data, 'text/html');
        this.showProgressBar = false;
      },
      err => console.log(err)
    );
  }
}
