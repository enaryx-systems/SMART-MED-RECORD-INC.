import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface OrgFilterState {
  organizationId: string | null;
}

const initialState: OrgFilterState = {
  organizationId: null,
};

const orgFilterSlice = createSlice({
  name: "orgFilter",
  initialState,
  reducers: {
    setOrganizationFilter(state, action: PayloadAction<string | null>) {
      state.organizationId = action.payload;
    },
  },
});

export const { setOrganizationFilter } = orgFilterSlice.actions;
export default orgFilterSlice.reducer;
