"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const BASE_URL = "http://api.tvmaze.com/";
const $episodesList = $("#episodesList");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */


async function getShowsByTerm(term) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  /** Returns array of objects. Each object is every show returned from 
   * search. Each object contains id, name, summary and medium image.
   */

  // run async function using term to make request to tv maze api
  const response = await axios.get(`${BASE_URL}search/shows?q=${term}`);
  // console.log(response.data);
  const shows = response.data.map(_handleShowData);
  // console.log(showArray)
  return shows;
}

/** Parse received data from each show and return {id, name, summary, image} */
function _handleShowData(eachShow) {
  return {
    id: eachShow.show.id,
    name: eachShow.show.name,
    summary: eachShow.show.summary,
    image: eachShow.show.image
      ? eachShow.show.image.medium 
      : "https://static.tvmaze.com/uploads/images/medium_portrait/147/369403.jpg"
  }
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {

  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src=${show.image}
              alt="image for ${show.name}"
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  let res = await axios.get(`${BASE_URL}shows/${id}/episodes`);
  let episodes = res.data.map(_handleEpisodeData);
  return episodes;
}

/** Parse data from each episode to return {id, name, season, number} */
function _handleEpisodeData(eachEpisode) { //"_" denotes internal function that other people might not need to know
  return {
    id: eachEpisode.id,
    name: eachEpisode.name,
    season: eachEpisode.season,
    number: eachEpisode.number
  };
}

/** takes and array of episodes data objects, turn into a list, and append to DOM */

function populateEpisodes(episodes) {
  $episodesList.empty();
  for (let episode of episodes) {
    const episodeLi = `
     <li>${episode.name} (season ${episode.season}, number ${episode.number})  </li>
    `;
    $episodesList.append(episodeLi);
  }
}

/** Add event listener to showsList, determine which button was clicked
 * obtain parent data-show-id through parentUntil to class of Show
 * Trigger getEpisodesOfShow and populateEpisodes using id
*/

$showsList.on("click", "button", episodeButton);

async function episodeButton(evt) {
  const $show = $(evt.target).closest(".Show");
  //console.log($show);
  const showID = $show.data("show-id");
  //console.log(showID);
  const episodes = await getEpisodesOfShow(showID);
  populateEpisodes(episodes);
  $episodesArea.show();
}
