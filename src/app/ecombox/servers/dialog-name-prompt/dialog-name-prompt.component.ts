import { Component } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'ngx-dialog-name-prompt',
  templateUrl: 'dialog-name-prompt.component.html',
  styleUrls: ['dialog-name-prompt.component.scss'],
})
export class DialogNamePromptComponent {

  constructor(protected ref: NbDialogRef<DialogNamePromptComponent>) {}

  err: string;

  cancel() {
    this.ref.close();
  }

  submit(name) {
      if((name == "")||(name != "oui")){
                  this.err = "Saisir 'oui' pour confirmer la suppression";
          }
      else{
                  this.ref.close(name);
      }
  }
}
