import { Component, OnInit } from '@angular/core';
import {RankingDto} from "../../models";
import {ApiService} from "../../api.service";

@Component({
  selector: 'app-rangliste',
  templateUrl: './rangliste.page.html',
  styleUrls: ['./rangliste.page.scss'],
})
export class RanglistePage implements OnInit {
  selectedItem: number = 3;
  rankings: RankingDto[] = []; // Store rankings data

  constructor(private apiService: ApiService) { }

  onItemClick(itemNumber: number) {
    this.selectedItem = itemNumber; // Update the selected item
  }

  ngOnInit() {
    this.loadRankings();
  }

  loadRankings() {
    this.apiService.getRankingsGroupByDepartment().subscribe((data: RankingDto[]) => {
      this.rankings = data;
    }, error => {
      console.error('Error fetching rankings', error);
    });
  }
}
