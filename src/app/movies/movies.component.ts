import {Component, Input, OnChanges} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {MovieCopy} from '../types';
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition,} from '@angular/material/snack-bar';

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

  copies: MovieCopy[] = [];
  copyNames: string[] = [];
  selectedCopiesIDs: string[] = [];
  movieTitle!: string;

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {
  }

  ngOnChanges(): void {
    if (this.docObjectMovie !== undefined) {
      const titlePage = this.docObjectMovie.getElementsByTagName('title')[0].textContent as string;
      if (titlePage.includes('X265LK') || titlePage.includes('ceylonstream')) {
        this.scrapeX265LK();
      }
    }
  }

  getMovieTitle(): string {
    const titleSection = this.docObjectMovie.getElementsByClassName('sheader')[0];
    const titleDiv = titleSection.getElementsByClassName('data')[0];
    return titleDiv.getElementsByTagName('h1')[0].textContent as string;
  }

  getMovieCopyObject(copyRow: HTMLTableRowElement, id: string): MovieCopy {
    const dataRows = copyRow.getElementsByTagName('td');
    const copyName = dataRows[1].textContent as string;
    const copySize = dataRows[3].textContent as string;
    const copyLink = dataRows[0].getElementsByTagName('a')[0].href;

    return {
      id: parseInt(id),
      name: copyName,
      size: copySize,
      link: copyLink,
    };
  }

  scrapeX265LK(): void {
    this.selectedCopiesIDs = [];
    this.copyNames = [];
    this.copies = [];
    this.movieTitle = this.getMovieTitle();

    const copiesData = this.docObjectMovie.getElementsByClassName(
      'fix-table'
    )[0];
    const tbody = copiesData.getElementsByTagName('tbody')[0];
    const copiesRows = tbody.getElementsByTagName('tr');

    for (const copy in copiesRows) {
      const copyRow = copiesRows[copy];

      if (typeof copyRow === 'object') {
        const copyObj = this.getMovieCopyObject(copyRow, copy);
        this.copyNames.push(`${copyObj.name}  ${copyObj.size}`);
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
        this.http.get(url, {responseType: 'text'}).subscribe(
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
