import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { HideModal, ShowModal } from '../../../providers/common-service/common.service';

@Component({
  standalone: true,
  selector: 'app-message-modal',
  templateUrl: './message-modal.component.html',
  styleUrls: ['./message-modal.component.scss'],
  imports: [FormsModule, CommonModule]
})
export class MessageModalComponent implements OnInit {
  data: IModalData = null;
  isReady: boolean = false;
  modalSize: string = "";
  bodyContent: any = null;

  constructor(private sanitizer: DomSanitizer) { }

  @Input("Data")
  set pagination(value: IModalData) {
    if (value) {
      this.data = value;
      switch(this.data.Type) {
        case 2: // medium
          this.modalSize = "modal-lg";
          break;
        case 3: // large
          this.modalSize = "modal-xl";
          break;
        default: // for small size
          this.modalSize = "";
          break;
      }

      if (this.data.IsHtml) {
        this.bodyContent = this.sanitizer.bypassSecurityTrustHtml(this.data.Message);
      } else {
        this.bodyContent = this.data.Message;
      }
      this.validateBuildModal();
    }
  }

  ngOnInit(): void {
    this.data =   {
      Title: null,
      Message: "",
      Type: 0,
      ButtonName: "",
      IsSuccessFullCreation: false
    };
  }

  validateBuildModal() {
    this.isReady = true;
    ShowModal("messageModal");
  }

  closeModal() {
    HideModal("messageModal");
  }
}

export interface IModalData {
  Title?: string;
  Message: string;
  IsHtml?: boolean;
  Type: number; // 1 = small, 2 = medium, 3 large
  ButtonName?: string;
  IsSuccessFullCreation?: boolean;
}
