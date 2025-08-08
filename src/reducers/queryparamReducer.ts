import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type QPState = {
  roomId: string,
  // jobId: string,
  // custEmailId: string,
  candid:string,
  agentId: string,
  name:string
  isHost: boolean,
  meetingIsLegit: boolean,
};

const initialQPState = {
  roomId: "",
  candid:"",
  // jobId: "",
  // custEmailId: "",
  agentId: "",
  name:"",
  isHost: false,
  meetingIsLegit: false,
} as QPState;

// Create a slice for "queryparams"
const qpSlice = createSlice({
  name: "qpReducer",
  initialState: initialQPState,
  reducers: {
    // Optionally, you can add actions like reset
    resetQP: () => {
      return initialQPState;
    },
    setQP: (state, action: PayloadAction<QPState>) => {
      console.log('set qp',action)
      state = { ...state, ...action.payload };
      
      //state 
      return state
    }
  },
});

export type { QPState };
// Export actions so they can be dispatched from components
export const { resetQP, setQP } = qpSlice.actions;

// Export the reducer to be included in the store
export default {
  qpReducer: qpSlice.reducer,
};

