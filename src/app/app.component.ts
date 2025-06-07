import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

interface Product {
  productTypeId: number;
  productDescription: string;
}

interface Vendor {
  vendorId: string;
  vendorName: string;
}

interface State {
  stateCode: string;
  stateName: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'multi-select-dropdown';

  products: Product[] = [
    { productTypeId: 1, productDescription: 'Laptop' },
    { productTypeId: 2, productDescription: 'Mouse' },
    { productTypeId: 3, productDescription: 'Keyboard' },
    { productTypeId: 4, productDescription: 'Monitor' },
    { productTypeId: 5, productDescription: 'Webcam' },
    { productTypeId: 6, productDescription: 'Headphones' },
    { productTypeId: 7, productDescription: 'Speaker' },
    { productTypeId: 8, productDescription: 'Printer' },
  ];
  selectedProducts: (string | number)[] = [];

  vendors: Vendor[] = [
    { vendorId: '1', vendorName: 'Vendor A' },
    { vendorId: '2', vendorName: 'Vendor B' },
    { vendorId: '3', vendorName: 'Vendor C' },
    { vendorId: '4', vendorName: 'Vendor D' },
  ];
  selectedVendors: (string | number)[] = [];

  states: State[] = [
    { stateCode: 'NY', stateName: 'New York' },
    { stateCode: 'CA', stateName: 'California' },
    { stateCode: 'TX', stateName: 'Texas' },
    { stateCode: 'FL', stateName: 'Florida' },
    { stateCode: 'IL', stateName: 'Illinois' },
  ];
  selectedStates: (string | number)[] = [];

  filteredProducts: Product[] = [];
  // CHANGE THIS LINE: Explicitly define the type as (number | string)[]
  productSelectControl = new FormControl<(number | string)[]>([]);
  productSearchControl = new FormControl('');

  // Keep track of whether "All" is currently selected internally
  private isAllSelected: boolean = false;
  private destroy$ = new Subject<void>();

  //   ngOnInit() {
  //   this.filteredProducts = [...this.products];

  //   this.productSelectControl.valueChanges
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe(value => {
  //       // Ensure 'value' is treated as an array of (number | string)
  //       const currentSelection: (number | string)[] = Array.isArray(value) ? value : [];

  //       // Logic to handle "All" selection/deselection
  //       if (currentSelection.includes('all') && !this.isAllSelected) {
  //         this.selectAllProducts();
  //       } else if (!currentSelection.includes('all') && this.isAllSelected) {
  //         // If "All" was previously selected but now unselected by other means, deselect all products
  //         this.productSelectControl.setValue([], { emitEvent: false }); // Prevent infinite loop
  //         this.isAllSelected = false;
  //       } else if (currentSelection.length > 0 && !currentSelection.includes('all') && this.isAllSelected) {
  //         // If any item is deselected while "All" was selected, unselect "All"
  //         this.isAllSelected = false;
  //         const allIndex = currentSelection.indexOf('all'); // Now 'all' is allowed in the array type
  //         if (allIndex > -1) {
  //           const newSelection = [...currentSelection];
  //           newSelection.splice(allIndex, 1);
  //           this.productSelectControl.setValue(newSelection, { emitEvent: false });
  //         }
  //       } else if (currentSelection.length === this.products.length && !this.isAllSelected && !currentSelection.includes('all')) {
  //         // If all individual products are selected, but "All" isn't, automatically select "All"
  //         this.isAllSelected = true;
  //         this.productSelectControl.setValue([...this.getAllProductTypeIds(), 'all'], { emitEvent: false });
  //       }
  //     });

  //   this.productSearchControl.valueChanges
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe(searchText => {
  //       this.filterProducts(searchText);
  //     });
  // }

  ngOnInit() {
    // this.filteredProducts = [...this.products];
    // this.productSelectControl.valueChanges
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((value) => {
    //     // Ensure value is an array, handle null/undefined
    //     const currentSelection: (number | string)[] = Array.isArray(value)
    //       ? value
    //       : [];
    //     const allProductTypeIds = this.getAllProductTypeIds();
    //     // Extract only the product IDs from the current selection
    //     const selectedProductIds = currentSelection.filter(
    //       (item) => typeof item === 'number'
    //     ) as number[];
    //     // Check if 'all' is currently in the selection array
    //     const hasAllInSelection = currentSelection.includes('all');
    //     // Determine if all individual products are selected
    //     const areAllIndividualProductsSelected =
    //       selectedProductIds.length === allProductTypeIds.length;
    //     // SCENARIO A: User deselects an individual product while 'All' is checked
    //     if (this.isAllSelected && !areAllIndividualProductsSelected) {
    //       this.isAllSelected = false; // Internal flag to uncheck 'All'
    //       // Remove 'all' from the selection without re-triggering valueChanges
    //       const newValue = selectedProductIds; // Just the product IDs
    //       this.productSelectControl.setValue(newValue, { emitEvent: false });
    //     }
    //     // SCENARIO B: User selects all individual products, but 'All' is not yet checked
    //     else if (
    //       !this.isAllSelected &&
    //       areAllIndividualProductsSelected &&
    //       !hasAllInSelection
    //     ) {
    //       this.isAllSelected = true; // Internal flag to check 'All'
    //       // Add 'all' to the selection without re-triggering valueChanges
    //       const newValue = [...selectedProductIds, 'all'];
    //       this.productSelectControl.setValue(newValue, { emitEvent: false });
    //     }
    //     // SCENARIO C: Handle the case where 'All' was explicitly clicked and set (or cleared)
    //     // This is primarily managed by toggleAllSelection, but we ensure consistency.
    //     // If the 'all' option is present but not all individual items are selected, and our internal flag says all selected,
    //     // it means something went wrong, or a programmatic change happened without updating the internal flag.
    //     else if (
    //       hasAllInSelection &&
    //       !areAllIndividualProductsSelected &&
    //       this.isAllSelected
    //     ) {
    //       this.isAllSelected = false;
    //       const newValue = selectedProductIds;
    //       this.productSelectControl.setValue(newValue, { emitEvent: false });
    //     }
    //     // SCENARIO D: If selection becomes empty, ensure 'All' is deselected internally
    //     else if (selectedProductIds.length === 0 && this.isAllSelected) {
    //       this.isAllSelected = false;
    //     }
    //     // Additional debugging:
    //     // console.log('valueChanges:', currentSelection, 'isAllSelected:', this.isAllSelected, 'selectedProductIds:', selectedProductIds.length, 'totalProducts:', allProductTypeIds.length);
    //   });
    // this.productSearchControl.valueChanges
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((searchText) => {
    //     this.filterProducts(searchText);
    //   });
  }

  onProductsSelectionChange(selection: (string | number)[]): void {
    this.selectedProducts = selection;
    console.log('Selected Products:', this.selectedProducts);
  }

  onVendorsSelectionChange(selection: (string | number)[]): void {
    this.selectedVendors = selection;
    console.log('Selected Vendors:', this.selectedVendors);
  }

  onStatesSelectionChange(selection: (string | number)[]): void {
    this.selectedStates = selection;
    console.log('Selected States:', this.selectedStates);
  }

  private selectAllProductsInternal() {
    const allProductTypeIds = this.getAllProductTypeIds();
    this.productSelectControl.setValue([...allProductTypeIds, 'all']);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleAllSelection() {
    const allProductTypeIds = this.getAllProductTypeIds();

    // Toggle the internal state first
    this.isAllSelected = !this.isAllSelected;

    if (this.isAllSelected) {
      // If we want to select all, set the value to all product IDs PLUS 'all'
      this.productSelectControl.setValue([...allProductTypeIds, 'all']);
    } else {
      // If we want to deselect all, set the value to an empty array
      this.productSelectControl.setValue([]);
    }
    // Note: We don't use emitEvent: false here because we WANT valueChanges to run
    // for validation or other listeners outside this component.
    // The valueChanges logic is now designed to handle this change gracefully.
  }
  // toggleAllSelection() {
  //   if (this.isAllSelected) {
  //     this.productSelectControl.setValue([]);
  //     this.isAllSelected = false;
  //   } else {
  //     this.selectAllProducts();
  //     this.isAllSelected = true;
  //   }
  // }

  private selectAllProducts() {
    const allProductTypeIds = this.getAllProductTypeIds();
    // Ensure that 'all' is added to the value which expects (number | string)[]
    this.productSelectControl.setValue([...allProductTypeIds, 'all']);
  }

  private getAllProductTypeIds(): number[] {
    return this.products.map((product) => product.productTypeId);
  }

  private filterProducts(searchText: string | null) {
    if (!searchText) {
      this.filteredProducts = [...this.products];
      return;
    }
    const searchLower = searchText.toLowerCase();
    this.filteredProducts = this.products.filter((product) =>
      product.productDescription.toLowerCase().includes(searchLower)
    );
  }

  clearSearch(event: Event) {
    event.stopPropagation();
    this.productSearchControl.setValue('');
  }
}
