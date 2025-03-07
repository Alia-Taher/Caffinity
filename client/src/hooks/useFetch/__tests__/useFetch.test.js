import { renderHook, act, waitFor } from "@testing-library/react";

import useFetch from "../useFetch";
import {
  getUsersSuccessMock,
  getUsersFailedMock,
} from "../../../__testUtils__/fetchUserMocks";

// Reset mocks before every test
beforeEach(() => {
  fetch.resetMocks();
});

describe("useFetch", () => {
  it("Fetch process works as expected", async () => {
    fetch.mockResponseOnce(getUsersSuccessMock());
    const mockSuccessFn = jest.fn(() => {});
    const { result } = renderHook(() => useFetch("/", mockSuccessFn));

    // Nothing is performed yet
    expect(fetch.mock.calls.length).toEqual(0);
    expect(result.current.isLoading).toBe(false);
    expect(mockSuccessFn).not.toHaveBeenCalled();

    act(() => {
      result.current.performFetch();
    });

    // Should be loading
    expect(result.current.isLoading).toBe(true);

    // Wait until the loading is false
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Should not be loading anymore
    expect(result.current.isLoading).toBe(false);

    // Fetch should have been called and our success function should have been called
    expect(fetch.mock.calls.length).toEqual(1);
    expect(mockSuccessFn).toHaveBeenCalled();
  });

  it("Should set the error if something goes wrong on the server", async () => {
    fetch.mockResponseOnce(getUsersFailedMock());

    const { result } = renderHook(() => useFetch("/", () => {}));

    act(() => {
      result.current.performFetch();
    });

    // Should be loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(null);

    // Wait until the loading is false
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Should not be loading anymore
    expect(result.current.isLoading).toBe(false);

    // Should have an error
    expect(result.current.error).not.toBe(null);
  });
});
