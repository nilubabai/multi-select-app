// src/app/shared-multi-select/shared-multi-select.component.ts

import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { SelectOption } from '../interfaces/selectOptions';

@Component({
  selector: 'app-shared-multi-select',
  templateUrl: './shared-multi-select.component.html',
  styleUrls: ['./shared-multi-select.component.scss'],
})
export class SharedMultiSelectComponent
  implements OnInit, OnDestroy, OnChanges
{
  @Input() options: any[] = []; // The generic list of items (e.g., products, vendors)
  @Input() placeholder: string = 'Select Items';
  @Input() labelField: string = 'label'; // The property name for display text
  @Input() valueField: string = 'value'; // The property name for the unique ID

  // Output event to send selected values back to the parent
  @Output() selectionChange = new EventEmitter<(string | number)[]>();

  filteredOptions: SelectOption[] = [];
  selectControl = new FormControl<(number | string)[] | null>([]);
  searchControl = new FormControl('');

  private isAllSelected: boolean = false; // Internal flag for 'All' state
  private destroy$ = new Subject<void>();

  ngOnInit() {
    // Initialize filteredOptions based on the initial input options
    this.initializeOptions();

    this.selectControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        const currentSelection: (number | string)[] = Array.isArray(value)
          ? value
          : [];
        const allOptionValues = this.getAllOptionValues();

        const selectedOptionValues = currentSelection.filter(
          (item) => typeof item === 'string' || typeof item === 'number'
        ) as (string | number)[];

        const actualSelectedValues = selectedOptionValues.filter(
          (val) => val !== 'all'
        );

        const hasAllInSelection = currentSelection.includes('all');
        const areAllIndividualOptionsSelected =
          actualSelectedValues.length === allOptionValues.length;

        // SCENARIO A: User deselects an individual option while 'All' is checked
        if (this.isAllSelected && !areAllIndividualOptionsSelected) {
          this.isAllSelected = false;
          const newValue = actualSelectedValues;
          this.selectControl.setValue(newValue, { emitEvent: false });
          this.emitSelection(newValue);
        }
        // SCENARIO B: User selects all individual options, but 'All' is not yet checked
        else if (
          !this.isAllSelected &&
          areAllIndividualOptionsSelected &&
          !hasAllInSelection
        ) {
          this.isAllSelected = true;
          const newValue = [...actualSelectedValues, 'all'];
          this.selectControl.setValue(newValue, { emitEvent: false });
          this.emitSelection(actualSelectedValues);
        }
        // SCENARIO C: Consistency check: If 'All' is in selection but not all individuals are selected, and our flag says all selected
        else if (
          hasAllInSelection &&
          !areAllIndividualOptionsSelected &&
          this.isAllSelected
        ) {
          this.isAllSelected = false;
          const newValue = actualSelectedValues;
          this.selectControl.setValue(newValue, { emitEvent: false });
          this.emitSelection(newValue);
        }
        // SCENARIO D: If selection becomes empty, ensure 'All' is deselected internally
        else if (actualSelectedValues.length === 0 && this.isAllSelected) {
          this.isAllSelected = false;
          this.emitSelection([]);
        }
        // Default case: If none of the specific scenarios match, emit the current product selection (excluding 'all')
        else if (
          !hasAllInSelection ||
          (hasAllInSelection && areAllIndividualOptionsSelected)
        ) {
          this.emitSelection(actualSelectedValues);
        }
      });

    this.searchControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((searchText) => {
        this.filterOptions(searchText);
      });
  }

  // --- Handling Input Changes ---
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] && this.options) {
      // Ensure options is not undefined
      // If the options array changes, re-initialize and filter
      this.initializeOptions();
      // Also clear search when input options change to ensure all are shown
      this.searchControl.setValue('', { emitEvent: false });
      this.filterOptions(''); // Manually trigger filter with empty string
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleAllSelection() {
    const allOptionValues = this.getAllOptionValues();
    this.isAllSelected = !this.isAllSelected;

    if (this.isAllSelected) {
      this.selectControl.setValue([...allOptionValues, 'all']);
      this.emitSelection(allOptionValues);
    } else {
      this.selectControl.setValue([]);
      this.emitSelection([]);
    }
  }

  private initializeOptions(): void {
    // Ensure this.options is not null or undefined before mapping
    if (this.options) {
      this.filteredOptions = this.options.map(
        (item) =>
          ({
            value: item[this.valueField],
            label: item[this.labelField],
            ...item, // Spread the rest of the properties from the original item
          } as SelectOption)
      );
    } else {
      this.filteredOptions = []; // If options is null/undefined, initialize as empty
    }

    const currentSelected = this.selectControl.value
      ? this.selectControl.value.filter(
          (val) =>
            typeof val === 'number' ||
            (typeof val === 'string' && val !== 'all')
        )
      : [];
    this.isAllSelected =
      (currentSelected as (string | number)[]).length === this.options.length;
    if (this.isAllSelected && !currentSelected.includes('all')) {
      this.selectControl.setValue([...this.getAllOptionValues(), 'all'], {
        emitEvent: false,
      });
    }
  }

  private getAllOptionValues(): (string | number)[] {
    // Ensure this.options is not null or undefined before mapping
    if (this.options) {
      return this.options.map((option) => option[this.valueField]);
    }
    return []; // Return empty array if options is not available
  }

  // --- MODIFIED filterOptions METHOD ---
  private filterOptions(searchText: string | null) {
    // If searchText is empty or null, display all original options
    if (!searchText) {
      this.filteredOptions = this.options.map(
        (item) =>
          ({
            value: item[this.valueField],
            label: item[this.labelField],
            ...item,
          } as SelectOption)
      );
      return;
    }

    const searchLower = searchText.toLowerCase();
    this.filteredOptions = this.options
      .filter((option) =>
        option[this.labelField].toLowerCase().includes(searchLower)
      )
      .map(
        (item) =>
          ({
            value: item[this.valueField],
            label: item[this.labelField],
            ...item,
          } as SelectOption)
      );
  }

  clearSearch(event: Event) {
    event.stopPropagation();
    // Setting value to '' will trigger the searchControl.valueChanges subscription,
    // which then calls filterOptions('') and correctly resets the list.
    this.searchControl.setValue('');
  }

  private emitSelection(selected: (string | number)[]): void {
    this.selectionChange.emit(selected);
  }
}
