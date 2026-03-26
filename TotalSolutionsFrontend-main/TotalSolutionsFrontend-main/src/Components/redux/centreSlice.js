import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    centreNumber : null,
    centreId : null,
    centreName : null
};

const centreSlice = createSlice({
    name:"centre",
    initialState,
    reducers:{
        setCentre:(state,action) => {
            state.centreNumber = action.payload.centreNumber;
            state.centreId = action.payload.centreId;
            state.centreName = action.payload.centreName;
        },
        removeCentre:(state) => {
            state.centreNumber = null;
            state.centreId = null;
            state.centreName = null;
        }
    }
});

export const {setCentre,removeCentre} = centreSlice.actions;
export default centreSlice.reducer;