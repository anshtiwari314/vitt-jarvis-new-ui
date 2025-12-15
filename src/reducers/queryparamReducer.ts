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
  customer_id:string,

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
  customer_id: ""

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
    setQP: (_, action: PayloadAction<QPState>) => {
      console.log('qp params reducer receiving', action)
      return action.payload;
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

