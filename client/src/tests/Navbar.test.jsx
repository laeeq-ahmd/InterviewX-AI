import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import userReducer from "../redux/userSlice";
import Navbar from "../components/Navbar";

// Mock motion/react to avoid animation issues in tests
vi.mock("motion/react", () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock firebase.js to avoid real Firebase init
vi.mock("../utils/firebase", () => ({
  auth: {},
  provider: {},
}));

const renderNavbar = (userData = null) => {
  const store = configureStore({
    reducer: { user: userReducer },
    preloadedState: { user: { userData } },
  });
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    </Provider>
  );
};

describe("Navbar", () => {
  it("renders CareerX AI logo text", () => {
    renderNavbar();
    expect(screen.getByText(/CareerX AI/i)).toBeInTheDocument();
  });

  it("shows credit count of 0 when user is not logged in", () => {
    renderNavbar(null);
    // When logged out, credits show as 0
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
