import { Component, Input, OnChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MovieCopy } from '../types';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';

@Component({
  selector: 'app-movies',
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.css']
})
export class MoviesComponent implements OnChanges {

  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  @Input() docObjectMovie!: Document;
  @Input() showProgressBar!: boolean;

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  copies: MovieCopy[] = [];
  copyNames: string[] = [];
  selectedCopiesIDs: string[] = [];
  movieTitle!: string;

  ngOnChanges(): void {
    if (this.docObjectMovie !== undefined) {
      const titlePage = this.docObjectMovie.getElementsByTagName('title')[0].textContent as string;
      if (titlePage.includes('X265LK') || titlePage.includes('ceylonstream')) {
        this.scrapeX265LK();
      }
    }
  }

  scrapeX265LK(): void {
    const copiesData = this.docObjectMovie.getElementsByClassName(
      'fix-table'
    )[0];
    const tbody = copiesData.getElementsByTagName('tbody')[0];
    const copiesRows = tbody.getElementsByTagName('tr');

    const titleSection = this.docObjectMovie.getElementsByClassName(
      'sheader'
    )[0];
    const titleDiv = titleSection.getElementsByClassName('data')[0];
    const title = titleDiv.getElementsByTagName('h1')[0].textContent;
    this.movieTitle = title ? title : 'Movie Title';

    this.selectedCopiesIDs = [];
    this.copyNames = [];
    this.copies = [];

    for (const copy in copiesRows) {
      const copyRow = copiesRows[copy];

      if (typeof copyRow === 'object') {
        const dataRows = copyRow.getElementsByTagName('td');
        const copyName = dataRows[1].textContent
          ? dataRows[1].textContent
          : 'Copy Name';
        const copySize = dataRows[3].textContent
          ? dataRows[3].textContent
          : 'Copy Size';
        const copyLink = dataRows[0].getElementsByTagName('a')[0].href;

        const copyObj: MovieCopy = {
          id: parseInt(copy),
          name: copyName,
          size: copySize,
          link: copyLink,
        };
        this.copyNames.push(`${copyName}   ${copySize}`);
        this.copies.push(copyObj);
      }
    }
  }

  downloadCopies(): void {
    if (this.selectedCopiesIDs.length == 0) {
      this.openSnackBar('Select Atleast One Copy');
    } else {
      this.openSnackBar('Starting Download...');
      for (const id of this.selectedCopiesIDs) {
        const url = this.copies[parseInt(id)].link;
        this.http.get(url, { responseType: 'text' }).subscribe(
          (data: string) => {
            const docObj = new DOMParser().parseFromString(data, 'text/html');
            const linkDiv = docObj.getElementsByClassName('inside')[0];
            const link = linkDiv.getElementsByTagName('a')[0].href;
            if (link.includes('ceylonstream')) {
              window.open(link, '_blank');
            } else {
            window.location.href = link;
            }
          },
          err => console.log(err)
        );
      }
    }
  }

  openSnackBar(msg: string): void {
    this.snackBar.open(msg, 'OK', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 5000,
    });
  }

}
