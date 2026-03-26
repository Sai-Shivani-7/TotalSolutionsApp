import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  centreChildren: [],
  centreDoctors: [],
  centreTherapists: [],
  selectedCentreChild: null,
  selectedCentreDoctor: null,
  selectedCentreTherapist: null,
  appointmentDate: null,
  appointmentTime: null,
  loading: false,
  error: null,
};

export const centreSlice = createSlice({
  name: "centre",
  initialState,
  reducers: {
    setCentreChildren: (state, action) => {
      state.centreChildren = action.payload;
    },
    setCentreDoctors: (state, action) => {
      state.centreDoctors = action.payload;
    },
    setCentreTherapists: (state, action) => {
      state.centreTherapists = action.payload;
    },
    setSelectedCentreChild: (state, action) => {
      state.selectedCentreChild = action.payload;
    },
    setSelectedCentreDoctor: (state, action) => {
      state.selectedCentreDoctor = action.payload;
    },
    setSelectedCentreTherapist: (state, action) => {
      state.selectedCentreTherapist = action.payload;
    },
    setCentreAppointmentDate: (state, action) => {
      state.appointmentDate = action.payload;
    },
    setCentreAppointmentTime: (state, action) => {
      state.appointmentTime = action.payload;
    }
  },
});

export const {
  setCentreChildren,
  setCentreDoctors,
  setCentreTherapists,
  setSelectedCentreChild,
  setSelectedCentreDoctor,
  setSelectedCentreTherapist,
  setAppointmentDate,
  setAppointmentTime,

} = centreSlice.actions;

export default centreSlice.reducer;
