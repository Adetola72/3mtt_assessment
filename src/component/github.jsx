import { useState, useEffect } from "react";
import ReactPaginate from "react-paginate";
import "./github.css";

export default function Github() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const PER_PAGE = 3;

  useEffect(() => {
    if (result.length === 0) return; // Don't perform pagination if no results yet

    // Calculate the current page's data
    const startIndex = currentPage * PER_PAGE;
    const endIndex = startIndex + PER_PAGE;
    const currentPageData = result.slice(startIndex, endIndex);

    // Update the current page's data
    setCurrentPageData(currentPageData);
  }, [result, currentPage]);

  const [currentPageData, setCurrentPageData] = useState([]);

  function handlePageClick({ selected: selectedPage }) {
    setCurrentPage(selectedPage);
  }

  const onChangeHandler = (e) => {
    setInput(e.target.value);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    fetch(`https://api.github.com/search/users?q=${input}`)
      .then((response) => response.json())
      .then((data) => {
        setResult(data.items);
        setCurrentPage(0); // Reset to first page when new results are fetched
      });
  };

  const fetchRepositories = (username) => {
    return fetch(`https://api.github.com/users/${username}/repos`)
      .then((response) => response.json())
      .then((data) => data);
  };

  const handleViewRepositories = (username) => {
    fetchRepositories(username)
      .then((repositories) => {
        const updatedResult = result.map((user) => {
          if (user.login === username) {
            return { ...user, repositories };
          }
          return user;
        });
        setResult(updatedResult);
      })
      .catch((error) => console.error("Error fetching repositories:", error));
  };

  return (
    <div className="center">
      <h1>Github User's Repositories</h1>
      <form onSubmit={submitHandler}>
        <input
          type="text"
          id="in"
          placeholder="Enter Your Github Account Here"
          onChange={onChangeHandler}
        />
        <button type="submit">Search</button>
      </form>
      <ul>
        {currentPageData?.length === 0 ? (
          <li>No results found</li>
        ) : (
          currentPageData?.map((item) => (
            <div className="border" key={item.id}>
              <li>
                <strong>{item.login}</strong> - <br />
                <img src={item.avatar_url} alt="User Avatar" /> <br />
                <a
                  href={item.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Profile
                </a>{" "}
                <br />
                <button onClick={() => handleViewRepositories(item.login)}>
                  View Repositories
                </button>
                {item.repositories && (
                  <div>
                    <h3>Repositories:</h3>
                    <ul>
                      {item.repositories.map((repo) => (
                        <li key={repo.id}>
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {repo.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            </div>
          ))
        )}
      </ul>
      <ReactPaginate
        breakLabel="..."
        previousLabel="< previous"
        nextLabel="next >"
        pageCount={Math.ceil(result.length / PER_PAGE)} // Calculate page count based on result length
        onPageChange={handlePageClick}
        pageRangeDisplayed={5}
        renderOnZeroPageCount={null}
        className="paginate flex justify-between my-4"
      />
    </div>
  );
}
