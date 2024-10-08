import { Component, OnInit, Input, Output, EventEmitter, forwardRef, OnDestroy, HostListener, ElementRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { CommonService } from "../../../providers/common-service/common.service";
import { CommonModule } from "@angular/common";

/*



  let value = [{
                value: 'value used for the item (any type i.e string, array or any object)',
                text: 'text to be displayed (allow only string or number)'
              }];

  let placehosderName = 'Placeholder name';

  <bot-autocomplete [data]="autoCompleteModal" [(ngModel)]="employeeId"
  (OnSelect)="your-fn($event)"></bot-autocomplete>






*/

@Component({
  standalone: true,
  selector: "bot-autocomplete, bot-multiselect",
  templateUrl: "./iautocomplete.component.html",
  styleUrls: ["./iautocomplete.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IautocompleteComponent),
      multi: true,
    },
  ],
  imports: [CommonModule]
})
export class IautocompleteComponent implements OnInit, OnDestroy, ControlValueAccessor {
  BindingData: any = [];
  AutofillDroopdownHeight: any;
  HeightValue: number;
  AutofillObject: any;
  InitValue: string = "";
  InitData: string = "";
  isStartFilter: boolean = false;

  OriginalData: any = null;
  DropdownData: any = null;
  placeholder: string;
  currentValue: string;
  selectedIndex: number = -1;
  element: any;
  el: any;
  suggestions = [];
  badQueries = [];
  intervalId: any;
  cachedResponse = [];
  onChangeInterval: any;
  isLocal: any;
  ignoreValueChange: any;
  suggestionsContainer: any = null;
  options: any;
  classes: any;
  isShowEmptyRow: boolean = false;
  CurrentAutoComplete: any;
  manualFocus: boolean = false;
  value: any = null;
  IsMultiSelect: boolean = false;
  ClassName: string = ""
  Tabindex: string = "0";

  @Output() OnSelect = new EventEmitter();
  @Output() OnServerFilter = new EventEmitter();
  @Output() onKeyup = new EventEmitter();
  @Output() onFocus = new EventEmitter();

  @Input()
  set data(dataModal: autoCompleteModal) {
    if (dataModal) {
      this.placeholder = dataModal.placeholder;
      this.ClassName = dataModal.className;
      this.DropdownData = dataModal.data;
      this.OriginalData = dataModal.data;
    }

    this.isStartFilter = false;
    this.ManageBindingData();
  }

  get Data() {
    return this.OriginalData;
  }

  // Sync data changes

  onTuched: () => {};
  onChange: (v: any) => {};

  writeValue(value: string): void {
    this.value = value !== null ? value : "";
    this.BindDefaultValue();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void { }

  // ----------------------  ends ----------------------

  constructor(private commonService: CommonService,
    private elem: ElementRef) {

    this.HeightValue = 250;
    this.AutofillDroopdownHeight = this.HeightValue.toString() + "px";
    switch (elem.nativeElement.tagName) {
      case "BOT-MULTISELECT":
        this.IsMultiSelect = true;
        break;
      default:
        this.IsMultiSelect = false;
        break;
    }
    // this.RegisterListener();
  }

  ngOnDestroy(): void {
    this.isStartFilter = false;
    document.removeEventListener('click', null);
    console.log("Handler removed.");
  }

  @HostListener('document:click', ['$event'])
  CloseSuggestionBox(e: any) {
    if (e.target.getAttribute('title') != "bt-autocomplete") {
      if (this.CurrentAutoComplete) {
        this.isStartFilter = false;
        this.hide();
        this.killSuggestions();
      }
    }
  }

  LoadFromApi(e: any) {
    this.isStartFilter = true;
    this.OnServerFilter.emit(e.target.value);
  }

  BindDefaultValue() {
    if (this.value !== null && this.DropdownData) {
      let elems = this.DropdownData.filter(
        (x) => x.value === this.value
      );
      if (elems.length === 1) {
        this.InitValue = elems[0].text;
        this.InitData = JSON.stringify(elems[0].value);
      } else if (elems.length > 1) {
      }
    }
  }

  NoAction() {
    event.stopPropagation();
    event.preventDefault();
  }

  ManageBindingData() {
    if (this.commonService.IsValid(this.DropdownData)) {
      this.BindingData = null;
      this.BindingData = this.DropdownData;
      if (this.CurrentAutoComplete !== null) {
        this.suggestions = this.commonService.IsValid(this.DropdownData)
          ? this.DropdownData
          : [];
      }

      if (
        typeof this.BindingData !== "undefined" &&
        this.BindingData !== null
      ) {
        if (this.BindingData.length === 0) this.isShowEmptyRow = true;
        else this.isShowEmptyRow = false;
      } else {
        this.isShowEmptyRow = true;
      }
    }
  }

  ngOnInit() { }

  InitialSetup(a, b) {
    var c = function () { },
      cn = {
        autoSelectFirst: !1,
        appendTo: "iautofill-searchfield",
        serviceUrl: null,
        lookup: null,
        onValueSelect: null,
        width: "auto",
        minChars: 1,
        maxHeight: 200,
        deferRequestBy: 0,
        params: {},
        //formatResult: g.formatResult,
        delimiter: null,
        zIndex: 9999,
        type: "GET",
        noCache: !1,
        onSearchStart: c,
        onSearchComplete: c,
        containerClass: "autocomplete-suggestions",
        tabDisabled: !1,
        dataType: "text",
        lookupFilter: function (a, b, c) {
          return -1 !== a.value.toLowerCase().indexOf(c);
        },
        paramName: "query",
        transformResult: function (a) {
          return "string" === typeof a ? JSON.parse(a) : a;
        },
      };
    this.element = a;
    this.el = a;
    this.suggestions = this.commonService.IsValid(b.lookup) ? b.lookup : [];
    this.badQueries = [];
    this.selectedIndex = -1;
    this.currentValue = this.element.value;
    this.intervalId = 0;
    this.cachedResponse = [];
    this.isLocal = this.ignoreValueChange = !1;
    this.suggestionsContainer = a.closest('div[name="autofill-container"]').querySelector('div[name="iautofill-div"]');
    this.options = Object.assign({}, cn, b);

    this.classes = {
      selected: "autocomplete-selected",
      suggestion: "autocomplete-suggestion",
    };
    this.setOptions(b);
    setTimeout(() => {
      this.moveOnTab();
    }, 100);
  }



  ShowAutofillDropdown() {
    this.onFocus.emit();
    if (!this.manualFocus) {
      this.ManageBindingData();
      let eventTarget = (<Element>event.currentTarget).closest('div[name="autofill-container"]');
        let autocompleteInput = <HTMLInputElement>eventTarget.querySelector('input[name="autocomplete"]');
        autocompleteInput.value = "";
        let suggestionBox = eventTarget.querySelector('div[name="suggestionBox-dv"]');
        suggestionBox.classList.remove("d-none");
        this.manualFocus = true;
        autocompleteInput.focus();
        this.CurrentAutoComplete = <HTMLInputElement>eventTarget;
        this.InitialSetup(autocompleteInput, {
            lookup: this.BindingData,
            onValueSelect: null,
        });
    } else {
      this.manualFocus = false;
    }
  }

  onKeyPress(e: any) {
    switch (e.keyCode) {
      case 27:
        this.el.value = (this.currentValue);
        this.hide();
        break;
      case 9:
        if (-1 === this.selectedIndex) {
          let fulltext = e.currentTarget.value;
          this.selectOption({ value: fulltext, data: "" }, -1);
          this.hide();
          return;
        }
        this.select(this.selectedIndex, true, e);
        break;
      case 13:
        if (-1 === this.selectedIndex) {
          let fulltext = e.currentTarget.value;
          this.selectOption({ value: fulltext, data: "" }, -1);
          this.hide();
          return;
        }
        this.select(this.selectedIndex, 13 === e.keyCode, e);
        if (9 === e.keyCode && !1 === this.options.tabDisabled) return;
        break;
      case 38:
        this.moveUp();
        break;
      case 40:
        this.moveDown();
        break;
      default:
        return;
    }
    e.stopImmediatePropagation();
    e.preventDefault();
  }

  onKeyUp(a: any) {
    var b = this;
    switch (a.keyCode) {
      case 38:
      case 40:
        return;
    }
    clearInterval(b.onChangeInterval);
      if (b.el && b.currentValue !== b.el.value)
      if (0 < b.options.deferRequestBy)
        b.onChangeInterval = setInterval(function () {
          b.onValueChange();
        }, b.options.deferRequestBy);
      else {
        b.onValueChange();
      }
  }

  onValueChange() {
    var a;
    clearInterval(this.onChangeInterval);
    this.currentValue = this.element.value;
    a = this.getQuery(this.currentValue);
    this.selectedIndex = -1;
    this.ignoreValueChange
      ? (this.ignoreValueChange = !1)
      : a.length < this.options.minChars
        ? (this.BindingData = this.DropdownData)
        : this.getSuggestions(a);
  }

  getSuggestions(a) {
    // make ajax request;
    let Data = this.DropdownData;
    this.BindingData = [];
    let index = 0;
    while (index < Data.length) {
      if (
        Data[index].text && Data[index].text !== null &&
        Data[index].text.toLocaleLowerCase().indexOf(a.toLocaleLowerCase()) === 0
      ) {
        this.BindingData.push(Data[index]);
      }
      index++;
    }
  }

  getQuery(a) {
    var b = this.options.delimiter;
    if (!b) return a.trim();
    a = a.split(b);
    return a[a.length - 1].trim();
  }

  getSuggestionsLocal(a) {
    var b = a.toLowerCase(),
      c = this.options.lookupFilter;
    return {
      suggestions: this.options.lookup.filter(function (d) {
        return c(d, a, b);
    })
    };
  }

  hide() {
    this.selectedIndex = -1;
    (<HTMLInputElement>this.CurrentAutoComplete.querySelector('input[name="autocomplete"]')).value = "";
    this.CurrentAutoComplete.querySelector('div[name="suggestionBox-dv"]').classList.add("d-none");
  }

  activate(a) {
    var b = this.classes.selected;
    var c = this.suggestionsContainer;
    var d:any = Array.from(c.children);
    for (var i = 0; i < d.length; i++) {
        if (d[i].classList.contains(b)) {
            d[i].classList.remove(b);
        }
    }
    this.selectedIndex = a;
    return this.selectedIndex !== -1 && d.length > this.selectedIndex
        ? ((a = d[this.selectedIndex]), a.classList.add(b), a)
        : null;

  }

  // onBlur() {
  //   if(!this.IsMultiSelect) {
  //     this.hide();
  //     this.killSuggestions();
  //   }
  // }

  select(a, b, e: any) {
    var c = this.BindingData[a];
    if (this.IsMultiSelect) {
      if (c.selected) {
        c.selected = false;
      }
      else {
        c.selected = true;
      }

      this.OnSelect.emit(c);
      return;
    }

    c &&
      // (this.el.val(c),
      (this.el?.value == c,
        (this.ignoreValueChange = b),
        this.hide(),
        this.onValueSelect(a));
    this.selectOption(c, a);
  }

  selectOption(c, a) {
    const textFieldInput = <HTMLInputElement>this.CurrentAutoComplete.querySelector('input[name="iautofill-textfield"]');
    textFieldInput.value = c.text;
    textFieldInput.setAttribute("data", JSON.stringify(c));

    const suggestionBox = this.CurrentAutoComplete.querySelector('div[name="suggestionBox-dv"]');
    suggestionBox.classList.add("d-none");

    this.value = c.value;
    this.onChange(this.value);
    this.OnSelect.emit(c.value);
  }

  AddToAutoFillList() {
    this.CurrentAutoComplete = (<Element>event.currentTarget).closest("div");
    this.ToggleRemoveIcon((<HTMLElement>event.currentTarget).getAttribute("data"), true);
    this.ClearSelection();
  }

  ToggleRemoveIcon(JsonData: string, IsAddtoList: boolean) {
    let item = this.CurrentAutoComplete.querySelector('a[name="remove-pointer"]');
    if (item !== null) {
      item.classList.toggle("d-none");
      item.setAttribute("data", JsonData);
      if (IsAddtoList) {
        let parsedItem = JSON.parse(JsonData);
        this.BindingData.unshift(parsedItem);
      }
    }

  }

  ClearSelection() {
    let elem = <HTMLInputElement>this.CurrentAutoComplete.querySelector('input[name="iautofill-textfield"]');
    if (elem !== null) {
      elem.value = "";
      elem.setAttribute("data", "");
      this.InitData = "";
    }
  }

  moveUp() {
    -1 !== this.selectedIndex &&
      (0 === this.selectedIndex
        ? ((this.suggestionsContainer) // just removed the $
          .children()
          .first()
          .removeClass(this.classes.selected),
          (this.selectedIndex = -1),
          // this.el.val(this.currentValue))
          this.el.value = (this.currentValue))
        : this.adjustScroll(this.selectedIndex - 1));
  }

  moveDown() {
    this.selectedIndex !== this.BindingData.length - 1 &&
      this.adjustScroll(this.selectedIndex + 1);
  }

  moveOnTab() {
    this.selectedIndex !== this.BindingData.length - 1 &&
      this.EnableFieldOnTab(this.selectedIndex + 1);
  }

  EnableFieldOnTab(a) {
    var b = this.activate(a);
  }

  adjustScroll(a) {
    var b = this.activate(a),
    c,
    d;
if (b) {
    b = b.offsetTop;
    c = this.suggestionsContainer.scrollTop;
    d = c + this.options.maxHeight - 25;
    if (b < c) {
        this.suggestionsContainer.scrollTop = b;
    } else if (b > d) {
        this.suggestionsContainer.scrollTop = b - this.options.maxHeight + 32;
    }
    this.el.value = this.getValue(this.BindingData[a].text);
}

  }

  onValueSelect(a) {
    var b = this.options.onValueSelect;
    a = this.BindingData[a];
    if (this.el) {
      this.el.value = (this.getValue(a.value));
    }

    typeof b === "function" && b.call(this.element, a);
  }

  getValue(a) {
    var b = this.options.delimiter,
      c;
    if (!b) return a;
    c = this.currentValue;
    b = c.split(b);
    return 1 === b.length
      ? a
      : c.substr(0, c.length - b[b.length - 1].length) + a;
  }

  dispose() {
    this.el.off(".autocomplete").removeData("autocomplete");
    this.disableKillerFn();
    this.suggestionsContainer.remove();
  }

  setOptions(a) {
    var b = this.options;
    var h = {
      extend: function (a, b) {
        return Object.assign(a, b);
      },
      createNode: function (a) {
        var b = document.createElement("div");
        b.innerHTML = a;
        return b.firstChild;
      },
    };
    h.extend(b, a);
    this.isLocal = Array.isArray(b.lookup);
    if (this.isLocal) {
        b.lookup = this.verifySuggestionsFormat(b.lookup);
    }
    this.suggestionsContainer.style.maxHeight = b.maxHeight + "px";
    this.suggestionsContainer.style.width = b.width + "px";
    this.suggestionsContainer.style.zIndex = b.zIndex;
  }

  verifySuggestionsFormat(a) {
    if (a.length && typeof a[0] === "string") {
      return a.map(function (value) {
          return {
              value: value,
              data: null
          };
      });
  } else {
      return a;
  }
  }

  clearCache() {
    this.cachedResponse = [];
    this.badQueries = [];
  }

  clear() {
    this.clearCache();
    this.currentValue = null;
    this.suggestions = [];
  }

  fixPosition() {
    if (this.options?.appendTo === 'body') {
      const elPosition = this.el.nativeElement.getBoundingClientRect();
      this.suggestionsContainer?.style.setProperty(
        'top',
        elPosition.top + this.el.nativeElement.offsetHeight + 'px'
      );
      this.suggestionsContainer?.style.setProperty('left', elPosition.left + 'px');
    }
  }

  enableKillerFn() {
    document.addEventListener('click', this.killerFn, true);
  }

  disableKillerFn() {
    document.removeEventListener('click', this.killerFn, true);
  }

  killerFn(b) {
    if (!b.target.closest("." + this.options.containerClass)) {
      this.killSuggestions();
      this.disableKillerFn();
  }
  if (!this.suggestionsContainer) {
      return;
  }

  }

  killSuggestions() {
    let a: any = this;
    a.stopKillSuggestions();
    a.intervalId = window.setInterval(function () {
      a.hide();
      a.stopKillSuggestions();
    }, 300);
  }

  stopKillSuggestions() {
    window.clearInterval(this.intervalId);
  }
}

export class
  pairData {
  value: any = null;
  text: string = "";
  selected?: boolean = false;
  email?: string = "";
  ParentNode?: number = 0;
}

export class autoCompleteModal {
  constructor(text: string = 'Select your option') {
    this.placeholder = text;
  }

  data: Array<pairData> = [];
  className?: string = 'disabled-input';
  placeholder?: string = null;
  tabindex?: any = null;
  isMultiSelect?: boolean = false;
}
