import { Component, OnDestroy, OnInit,EventEmitter, Input, Output} from '@angular/core';
import { ExampleService } from 'src/app/_http-services/example.service';
import { UIService } from 'src/app/_utility-services/ui.service';


@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss']
})
export class ExampleComponent implements OnInit {
  
  constructor(
              private uiService: UIService) {
  }

  ngOnInit(){
    this.uiService.setCurrentPageName('GUIDE PAGE');
  }

}








/*import { Component, OnDestroy, OnInit,EventEmitter, Input, Output} from '@angular/core';
import { ExampleService } from 'src/app/_http-services/example.service';
import { UIService } from 'src/app/_utility-services/ui.service';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss']
})
export class ExampleComponent implements OnInit, OnDestroy {
  setup:string = '';
  punchline:string = '';
  constructor(private exampleService: ExampleService,
              private uiService: UIService) {
  }

  ngOnInit(){
    this.uiService.setCurrentPageName('Example Component');
  }
  ngOnDestroy(){
    this.uiService.setCurrentPageName('');
  }
  async getAJoke(){
    const joke = await this.exampleService.getAJoke();
    this.setup = joke.setup.toString();
    this.punchline = joke.punchline.toString();
  }
  async showSpinner(){
    const delay = (ms:number) => new Promise(res => setTimeout(res, ms));
    this.uiService.openSpinner();  
    await delay(3000);
    this.uiService.closeSpinner();
  }
  
}
*/