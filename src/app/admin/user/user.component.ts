import { Component, OnInit } from '@angular/core';
import { LayoutComponent } from '../../layout/layout/layout.component';
import { BtRecordNotFoundComponent } from '../../util/bt-record-not-found/bt-record-not-found.component';
import { CoreHttpService } from '../../../providers/AjaxServices/core-http.service';
import { Filter } from '../../../providers/userService';
import { ResponseModel } from '../../../auth/jwtService';
import { Toast } from '../../../providers/common-service/common.service';
import { PaginationComponent } from '../../util/pagination/pagination.component';
import { BreadcrumsComponent } from '../../util/breadcrums/breadcrums.component';
import { FormsModule } from '@angular/forms';
import { AllownumberDirective } from '../../util/directives/allownumber.directive';
import { CommonModule } from '@angular/common';
import { iNavigation } from '../../../providers/iNavigation';
import { ManageUser } from '../../../providers/constants';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [BtRecordNotFoundComponent, PaginationComponent, BreadcrumsComponent, FormsModule, AllownumberDirective, CommonModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent implements OnInit {
  isPageReady: boolean = false;
  userData: Filter = new Filter();
  users: Array<user> = [];
  anyFilter: string = "";
  userDetail: user = {
    userId: 0,
    firstName: "",
    lastName: "",
    address: "",
    mobileNumber: "",
    alternateNumber: "",
    emailId: "",
    accountId: "",
    referenceId: 0
  }
  orderByNameAsc: boolean = null;
  orderByMobileAsc: boolean = null;
  orderByAccountAsc: boolean = null;
  isFileFound: boolean = false;
  isInitialLoad: boolean = false;

  constructor(private layout: LayoutComponent,
              private http: CoreHttpService,
              private nav: iNavigation
  ) {
  }

  ngOnInit() {
    this.layout.stopSkeleton();
    this.isInitialLoad = true;
    this.loadData();
  }

  loadData() {
    this.isPageReady = false;
    this.layout.startSkeleton();
    this.isFileFound = false;
    this.http.post("user/filterUser", this.userData).then((res: ResponseModel) => {
      if (res.ResponseBody) {
        this.users = res.ResponseBody;
        if (this.users && this.users.length > 0) {
          this.userData.totalRecords = this.users[0].total;
          this.isFileFound = true;
        }
        else {
          this.userData.totalRecords = 0;
        }
        if (this.isInitialLoad) {
          let elem = document.getElementById('namefilter');
          if(elem)elem.focus();
        }
        this.isInitialLoad = false;
        Toast("Record found");
        this.layout.stopSkeleton();
        this.isPageReady = true;
      }
    }).catch(e => {
      this.layout.stopSkeleton();
      this.isPageReady = true;
    })
  }

  navtoAddEmp() {
    this.nav.navigate(ManageUser, null);
  }

  resetFilter() {
    this.userData = new Filter();
    this.userDetail.name="";
    this.userDetail.mobileNumber = null;
    this.userDetail.emailId="";
    this.anyFilter = "";
    const elem = document.querySelectorAll('input');
    if (elem.length > 0) {
      elem.forEach(x => {
        x.blur();
      })
    }
    this.loadData();
  }

  globalFilter(inputElement: HTMLInputElement) {
    let searchQuery = "";
    this.userData.reset();
    searchQuery= `firstName like '%${this.anyFilter}%' OR emailId like '%${this.anyFilter}%' OR mobileNumber like '%${this.anyFilter}%'`;
    this.userData.searchString = `1=1 And ${searchQuery}`;
    this.loadData();
    inputElement.focus();
  }

  filterRecords(inputElement: HTMLInputElement) {
    let delimiter = "";
    this.userData.searchString = ""
    this.userData.reset();
    if(this.userDetail.mobileNumber !== null && this.userDetail.mobileNumber.trim() !== '') {
      this.userData.searchString += `1=1 And mobileNumber like '%${this.userDetail.mobileNumber}%'`;
      delimiter = "and";
    }

    if(this.userDetail.name !== null && this.userDetail.name !== "") {
      this.userData.searchString += ` 1=1 and firstName like '%${this.userDetail.name}%' or lastName like '%${this.userDetail.name}%'`;
      delimiter = "and";
    }

    if(this.userDetail.emailId !== null && this.userDetail.emailId !== "") {
      this.userData.searchString += `1=1 And emailId like '%${this.userDetail.emailId}%'`;
      delimiter = "and";
    }


    this.loadData();
    setTimeout(() => {
      inputElement.focus();
    }, 0);
  }

  arrangeDetails(flag: any, FieldName: string) {
    let Order = '';
    if(flag || flag == null) {
      Order = 'Asc';
    } else {
      Order = 'Desc';
    }
    if (FieldName == 'firstName') {
      this.orderByNameAsc = !flag;
      this.orderByMobileAsc = null;
      this.orderByAccountAsc = null;
    } else if (FieldName == 'mobileNumber') {
      this.orderByMobileAsc = !flag;
      this.orderByAccountAsc = null;
      this.orderByNameAsc = null;
    }
    if (FieldName == 'accountId') {
      this.orderByAccountAsc = !flag;
      this.orderByNameAsc = null;
      this.orderByMobileAsc = null;
    }
    this.userData = new Filter();
    this.userData.sortBy = FieldName +" "+ Order;
    this.loadData()
  }

  getOnlyPositiveNUmber(event: any) {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    value = value.replace(/[^0-9]/g, '');
    if (value.length > 10)
      value = value.slice(0, 10);

    input.value = value;
  }

  GetFilterResult(e: Filter) {
    if(e != null) {
      this.userData = e;
      this.loadData();
    }
  }

  getBackgroundColor() {
    let colorCode = ["#cff6ff", "#a6edeb", "#d9d1ff", "#ffdbdc", "#ffcdc7", "#fef2cd", "#dbffc4", "#f3ffc7", "#deccff", "#fdcfff"]
    const randomIndex = Math.floor(Math.random() * colorCode.length);
    return colorCode[randomIndex];
  }

  editUser(user: user) {
    this.nav.navigate(ManageUser, user);
  }
}

export interface user {
  rowIndex?: number,
  userId: number,
  firstName: string,
  lastName: string,
  address: string,
  mobileNumber: string,
  alternateNumber: string,
  emailId: string,
  accountId: string,
  referenceId: number,
  dob?: Date,
  createdBy?: number,
  updatedBy?: number,
  createdOn?: Date,
  updatedOn?: Date,
  total?: number,
  name?: string,
}
