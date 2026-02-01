import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/projects/`;

export const getProjects = createAsyncThunk('projects/getAll', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(API_URL, config);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const createProject = createAsyncThunk('projects/create', async (projectData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.post(API_URL, projectData, config);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    projects: [],
    isLoading: false,
    isError: false,
    message: '',
  },
  reducers: {
    resetProjects: (state) => {
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProjects.pending, (state) => { state.isLoading = true; })
      .addCase(getProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload;
      })
      .addCase(getProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.unshift(action.payload); 
      });
  },
});

export const { resetProjects } = projectSlice.actions;
export default projectSlice.reducer;
