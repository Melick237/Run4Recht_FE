import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CourtDto, DepartmentDto, PeriodStatisticDto, RankingDto, StatisticDto, TimePeriodDto, UserDto, Role } from './models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/api'; // Base URL of your Spring Boot application

  constructor(private http: HttpClient) {}

  // Authentication APIs
  login(userDto: UserDto): Observable<UserDto> {
    return this.http.post<UserDto>(`${this.baseUrl}/auth/login`, userDto);
  }

  // Court APIs
  getCourts(): Observable<CourtDto[]> {
    return this.http.get<CourtDto[]>(`${this.baseUrl}/gerichte`);
  }

  // Department APIs
  getDepartments(): Observable<DepartmentDto[]> {
    return this.http.get<DepartmentDto[]>(`${this.baseUrl}/dienstellen`);
  }

  getDepartmentById(departmentId: number): Observable<DepartmentDto> {
    return this.http.get<DepartmentDto>(`${this.baseUrl}/dienstellen/${departmentId}`);
  }

  // Ranking APIs
  getRankingsGroupByDepartment(): Observable<RankingDto[]> {
    return this.http.get<RankingDto[]>(`${this.baseUrl}/ranking`);
  }

  getRankingsGroupByDepartmentWithPeriod(timePeriodDto: TimePeriodDto): Observable<RankingDto[]> {
    return this.http.post<RankingDto[]>(`${this.baseUrl}/ranking/zeitraum`, timePeriodDto);
  }

  getRankingByCurrentMonth(): Observable<RankingDto[]> {
    return this.http.get<RankingDto[]>(`${this.baseUrl}/ranking/aktueller-monat`);
  }

  // Statistic APIs
  getStatisticsGroupByDepartment(departmentId: number): Observable<StatisticDto[]> {
    return this.http.get<StatisticDto[]>(`${this.baseUrl}/statistiken/dienstellen/${departmentId}`);
  }

  getStatisticsGroupByDepartmentWithPeriod(departmentId: number, timePeriodDto: TimePeriodDto): Observable<StatisticDto[]> {
    return this.http.post<StatisticDto[]>(`${this.baseUrl}/statistiken/dienstellen/${departmentId}/zeitraum`, timePeriodDto);
  }

  getStatistics(userId: number): Observable<StatisticDto[]> {
    return this.http.get<StatisticDto[]>(`${this.baseUrl}/statistiken/${userId}`);
  }

  getStatisticsWithPeriod(userId: number, timePeriodDto: TimePeriodDto): Observable<StatisticDto[]> {
    return this.http.post<StatisticDto[]>(`${this.baseUrl}/statistiken/${userId}/zeitraum`, timePeriodDto);
  }

  getStatisticsByCurrentMonth(userId: number): Observable<StatisticDto[]> {
    return this.http.get<StatisticDto[]>(`${this.baseUrl}/statistiken/aktueller-monat/${userId}`);
  }

  updateStatistic(dto: StatisticDto): Observable<StatisticDto> {
    return this.http.put<StatisticDto>(`${this.baseUrl}/statistiken`, dto);
  }

  updateStatistics(psDto: PeriodStatisticDto): Observable<StatisticDto[]> {
    return this.http.put<StatisticDto[]>(`${this.baseUrl}/statistiken/zeitraum`, psDto);
  }

  // User APIs
  getUsers(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(`${this.baseUrl}/mitarbeiter`);
  }

  getUsersInDepartment(departmentId: number): Observable<UserDto[]> {
    return this.http.post<UserDto[]>(`${this.baseUrl}/mitarbeiter/${departmentId}`, { departmentId });
  }
}
