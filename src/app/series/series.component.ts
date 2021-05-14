import { Component, Input, OnChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Season, Episode } from '../types';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';

@Component({
  selector: 'app-series',
  templateUrl: './series.component.html',
  styleUrls: ['./series.component.css']
})
export class SeriesComponent implements OnChanges {
  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  @Input() docObjectTV!: Document;
  @Input() showProgressBar!: boolean;

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  seasons: Season[] = [];
  seasonNames: Array<string[]> = [];
  selectedEpisodeIDs: Array<number[]> = [];
  seriesTitle!: string;

  ngOnChanges(): void {
    if (this.docObjectTV !== undefined) {
      const seasonsData = this.docObjectTV.getElementById(
        'seasons'
      ) as HTMLDivElement;
      const seasonDivs = seasonsData.getElementsByClassName('se-c');
      this.selectedEpisodeIDs = [];
      this.seasonNames = [];
      this.seasons = [];

      const titleSection = this.docObjectTV.getElementsByClassName(
        'sheader'
      )[0];
      const titleDiv = titleSection.getElementsByClassName('data')[0];
      const title = titleDiv.getElementsByTagName('h1')[0].textContent;
      this.seriesTitle = title ? title : 'Series Title';

      for (const div in seasonDivs) {
        const seasonEpisodes: string[] = [];
        const seasonDiv = seasonDivs[div];

        if (typeof seasonDiv === 'object') {
          const seasonID: number[] = [];
          this.selectedEpisodeIDs.push(seasonID);
          const numberDiv = seasonDiv.getElementsByClassName('se-q')[0];
          const seasonNumber = numberDiv.getElementsByTagName('span')[0]
            .textContent as string;
          const episodesList = seasonDiv.getElementsByTagName('li');
          const episodes: Episode[] = [];

          for (const ep in episodesList) {
            const episode = episodesList[ep];

            if (typeof episode == 'object') {
              let epNumber = episode.getElementsByClassName('numerando')[0]
                .textContent as string;
              const epiLInk = episode.getElementsByTagName('a')[0].href;
              if (epiLInk.includes('ceylonstream')) {
                  epNumber += ' - Complete Season MEGA Folder';
                }
              const epi: Episode = { episodeNumber: epNumber, url: epiLInk };
              seasonEpisodes.push(epNumber);
              episodes.push(epi);
            }
          }

          const season: Season = { seasonNumber, episodes };
          this.seasons.push(season);
          this.seasonNames.push(seasonEpisodes);
        }
      }
    }
  }

  selectAll(checked: boolean, i: number): void {
    const epCount = this.seasons[i].episodes.length;
    if (checked) {
      const episodeNumbers: number[] = [];
      for (let ep = 0; ep < epCount; ep++) {
        episodeNumbers.push(ep);
      }
      this.selectedEpisodeIDs[i] = episodeNumbers;
    } else {
      this.selectedEpisodeIDs[i] = [];
    }
  }

  downloadCopies(): void {
    let epCount = 0;
    this.selectedEpisodeIDs.forEach((season: number[]) => {
      epCount += season.length;
    });

    if (epCount == 0) {
      this.openSnackBar('Select Atleast One Episode');
    } else {
      this.openSnackBar('Starting Download...');
      this.selectedEpisodeIDs.forEach((season: number[]) => {
        const seasonNo = this.selectedEpisodeIDs.indexOf(season);
        season.forEach((ep: number) => {
          const episodes = this.seasons[seasonNo].episodes;
          this.http.get(episodes[ep].url, { responseType: 'text' }).subscribe(
            (data: string) => {
              const docObject = new DOMParser().parseFromString(
                data,
                'text/html'
              );
              const copiesData = docObject.getElementsByClassName(
                'fix-table'
              )[0];
              const tbody = copiesData.getElementsByTagName('tbody')[0];
              const copyRow = tbody.getElementsByTagName('tr')[0];
              const dataRow = copyRow.getElementsByTagName('td')[0];
              const copyLink = dataRow.getElementsByTagName('a')[0].href;
              this.http.get(copyLink, { responseType: 'text' }).subscribe(
                (data: string) => {
                  const docObj = new DOMParser().parseFromString(
                    data,
                    'text/html'
                  );
                  const linkDiv = docObj.getElementsByClassName('inside')[0];
                  const link = linkDiv.getElementsByTagName('a')[0].href;
                  window.open(link, '_blank');
                },
                err => console.log(err)
              );
            },
            err => console.log(err)
          );
        });
      });
    }
  }

  openSnackBar(message: string): void {
    this.snackBar.open(message, 'OK', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 5000,
    });
  }
}
