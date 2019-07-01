import React, { Component } from "react";
import "./App.css";
import getData from "../../services/api";
import CardList from "../CardList/CardList";
import Filters from "../Filters/Filters";

class App extends Component {
  constructor(props) {
    super(props);
    this.sortByName = this.sortByName.bind(this);
    this.searchByName = this.searchByName.bind(this);
    this.addMoreCards = this.addMoreCards.bind(this);
    this.removeCards = this.removeCards.bind(this);
    this.addToFavourites = this.addToFavourites.bind(this);
    this.filterLocation = this.filterLocation.bind(this);
  }

  state = {
    list: [],
    favourites:
      JSON.parse(localStorage.getItem("favourites")) === null
        ? []
        : JSON.parse(localStorage.getItem("favourites")),
    removeFlag: true,
    addFlag: false,
    listCopy: [],
    currentFiltered: [],
    filteredList: [],
    filteredListCopy: [],
    searchFromInput: null,
    quantity: 4,
    position: 0,
    counter: 0,
    listLength: null,
    gender: ""
  };

  async componentDidMount() {
    const list = await getData();
    this.setState(state => {
      return {
        list: list,
        listCopy: state.list,
        filteredList: list,
        currentFiltered: list
      };
    });

    this.addMoreCards();
  }

  filterLocation(event) {
    event.persist();

    this.setState(state => {
      let value = event.target.value;
      let filteredCopy;

      if (value !== "Human" && value !== "Alien") {
        filteredCopy = state.list;
      } else {
        filteredCopy = state.list.filter(item => item.species === value);
      }

      return {
        currentFiltered: filteredCopy,
        filteredList: filteredCopy.slice(0, 4),
        position: 4
      };
    });
  }

  searchByName(event) {
    event.persist();

    this.setState(state => {
      if (event.target.value) {
        const filtered = [...state.filteredList].filter(item => {
          return item.name
            .toLowerCase()
            .includes(event.target.value.toLowerCase().trim());
        });

        return { filteredList: filtered };
      }

      if (!event.target.value) {
        return {
          filteredList: state.list.slice(
            0,
            state.quantity + state.position - state.quantity
          )
        };
      }
    });
  }

  sortByName(event) {
    let sortedList = this.state.filteredList.sort((i, j) => {
      let sortType = event.target.id;
      if (sortType === "asc") {
        return i.name > j.name ? 1 : -1;
      } else if (sortType === "desc") {
        return i.name > j.name ? -1 : 1;
      }
    });

    this.setState({ filteredList: sortedList });
  }

  addMoreCards() {
    let filtered = this.state.currentFiltered.slice(
      this.state.position,
      this.state.quantity + this.state.position
    );

    if (this.state.position > 0) {
      this.setState(state => {
        return {
          filteredList: state.filteredList.concat(filtered),
          filteredListCopy: state.filteredList.concat(filtered),
          position:
            state.position < state.list.length
              ? state.position + state.quantity
              : state.list.length - 1,
          addFlag: state.position >= state.list.length ? true : false,
          removeFlag: false
        };
      });
    } else {
      this.setState(state => {
        return {
          position: state.position + state.quantity,
          filteredList: filtered,
          filteredListCopy: filtered,
          removeFlag: false
        };
      });
    }
  }

  removeCards() {
    let filtered = this.state.filteredList.slice();

    this.setState(state => {
      filtered.splice(-4, 4);

      if (state.position <= 3 || state.filteredList.length <= 4) {
        return {
          filteredList: [],
          filteredListCopy: [],
          position: 0,
          removeFlag: true
        };
      } else {
        return {
          filteredList: filtered,
          addFlag: false,
          filteredListCopy: filtered,
          position: state.position <= 0 ? 0 : state.position - 4
        };
      }
    });
  }

  addToFavourites(event) {
    event.persist();

    if (this.state.favourites.includes(event.target.id)) {
      this.setState(state => {
        let elemIndex = state.favourites.indexOf(event.target.id);
        let newArr = [...state.favourites];
        newArr.splice(elemIndex, 1);
        localStorage.setItem("favourites", JSON.stringify(newArr));
        return { favourites: newArr };
      });
    } else {
      this.setState(state => {
        let newState = [...state.favourites, event.target.id];
        localStorage.setItem("favourites", JSON.stringify(newState));
        return { favourites: newState };
      });
    }
  }

  render() {
    return (
      <div className="App">
        <Filters
          sortName={this.sortByName}
          searchName={this.searchByName}
          addItems={this.addMoreCards}
          removeItems={this.removeCards}
          filterLocation={this.filterLocation}
          addFlag={this.state.addFlag}
          removeFlag={this.state.removeFlag}
        />
        <CardList
          list={this.state.filteredList}
          addToFavourites={this.addToFavourites}
          favourites={this.state.favourites}
        />
      </div>
    );
  }
}

export default App;
