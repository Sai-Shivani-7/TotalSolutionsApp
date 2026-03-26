    import { createSlice } from "@reduxjs/toolkit";

    const initialState = {
        user:null,
        isAuthenticated:false,
    };

    const authSlice = createSlice({
        name:"auth",
        initialState,
        reducers:{
            login:(state,action) => {
                state.user = action.payload;
                state.isAuthenticated = true;
            },
            logout:(state) => {
                state.user = null;
                state.isAuthenticated = false;
            },
            addPropery:(state,action) => {
                state.user.details[action.payload.key] = action.payload.value;
            }
        }
    })

    export const {login,logout,addPropery} = authSlice.actions;
    export default authSlice.reducer;