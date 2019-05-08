import React, { Component } from 'react';
import nanoid from 'nanoid';
import { Route } from 'react-router-dom';
import { withRouter } from 'react-router';
import LocalStorage from '../localStorage';
import Board from '../Board';
import projectInfo from '../../../package.json';
import './index.scss';
import AddProject from '../AddProject';
import ProjectPage from '../ProjectPage';

class App extends Component {
    constructor() {
        super();
        this.localStorage = new LocalStorage(projectInfo.version, projectInfo.name);
        this.localStorage.dataset = this.localStorage.isEmpty ? this.defaultSettings : this.localStorage.dataset;
        const dataLS = this.localStorage.dataset;
        this.state = {
            lifeCycle: 111 * 1000,
            boards: dataLS,
            isOpenModalAddNewProject: false,
            isVisibleListOfFavouritesBoards: dataLS.find((project) => project.isFavourite) ? true : false,
            isVisibleRecentlyViewed: dataLS.find((project) => (project.isRecentlyViewed && !project.isFavourite)) ? true : false,
            searchValue: '',
            search: [],
        }
        this.inputSearch = React.createRef();
        this.checkForRecentlyViewed();
    }

    checkForRecentlyViewed = () => {
        let arr = this.localStorage.dataset;
        let dateNow = new Date().getTime();

        for (let i = 0; i < arr.length; i++) {
            if ((dateNow - arr[i].time) > this.state.lifeCycle) {
                arr[i].isRecentlyViewed = false;
            } else {
                arr[i].isRecentlyViewed = true;
            }
        }

        this.localStorage.dataset = arr;
    }

    get defaultSettings() {
        return [{
            id: nanoid(10),
            name: 'Test Project',
            time: new Date().getTime(),
            isRecentlyViewed: true,
            isFavourite: false
        },
        {
            id: nanoid(10),
            name: 'Tasks list',
            time: new Date().getTime(),
            isRecentlyViewed: true,
            isFavourite: false
        },
        {
            id: nanoid(10),
            name: 'Help us',
            time: new Date().getTime(),
            isRecentlyViewed: true,
            isFavourite: false
        },
        {
            id: nanoid(10),
            name: 'Try react',
            time: new Date().getTime(),
            isRecentlyViewed: true,
            isFavourite: false
        },
        {
            id: nanoid(10),
            name: 'Help us',
            time: new Date().getTime(),
            isRecentlyViewed: true,
            isFavourite: false
        },
        {
            id: nanoid(10),
            name: 'Help us',
            time: new Date().getTime(),
            isRecentlyViewed: true,
            isFavourite: false
        },
        {
            id: nanoid(10),
            name: 'Help us',
            time: new Date().getTime(),
            isRecentlyViewed: true,
            isFavourite: false
        }]
    }

    addProject = () => {
        this.setState({
            isOpenModalAddNewProject: true
        })
    };

    updateIsOpenWindow = () => {
        this.setState({
            isOpenModalAddNewProject: false
        });
    }

    addToFavourite = (data) => {
        const dataLS = this.localStorage.dataset;
        let counterBoardsResentlyViewed = 0;

        this.setState(() => ({
            boards: data
        }));

        for (let i = 0; i < dataLS.length; i++) {
            if (dataLS[i].isFavourite === false && dataLS[i].isRecentlyViewed === true) {
                counterBoardsResentlyViewed++;
            }
        }

        if (counterBoardsResentlyViewed === 0) {
            this.setState({
                isVisibleRecentlyViewed: false
            });
        } else {
            this.setState({
                isVisibleRecentlyViewed: true
            });
        }

        if (dataLS.find((element, index) => (dataLS[index].isFavourite === true))) {
            this.setState({
                isVisibleListOfFavouritesBoards: true
            });

            return;
        }

        this.setState({
            isVisibleListOfFavouritesBoards: false
        });
    }

    get classNames() {
        const { isOpenModalAddNewProject, isVisibleListOfFavouritesBoards, isVisibleRecentlyViewed } = this.state;

        const classNames = {
            overlay: ['overlay'],
            default: ['board'],
            addBoard: ['board board_add'],
            containerWithBoards: ['boards__container_hidden'],
            containerRecentlyViewed: ['boards__container_hidden']
        }

        if (isOpenModalAddNewProject) {
            classNames.overlay.push('overlay_visible');
        }

        if (isVisibleListOfFavouritesBoards) {
            classNames.containerWithBoards[0] = ('boards__container');
        }

        if (isVisibleRecentlyViewed) {
            classNames.containerRecentlyViewed[0] = ('boards__container');
        }

        return {
            default: classNames.default.join(' '),
            overlay: classNames.overlay.join(' '),
            addBoard: classNames.addBoard.join(' '),
            containerWithBoards: classNames.containerWithBoards.join(' '),
            containerRecentlyViewed: classNames.containerRecentlyViewed.join(' ')
        }
    }

    getDataForCreateProject = (data, background) => {
        const { boards } = this.state;
        let id = nanoid(20);

        boards.push({
            id,
            name: data,
            background
        });
        
        this.localStorage.dataset = boards;
        this.props.history.push(`/b/${id}/${data}`);
        this.setState({
            boards,
            isOpenModalAddNewProject: false
        });

    }

    renderCardsRecentlyViewed = () => {
        const { boards } = this.state;
        const recentlyViewed = [];

        for (let i = 0; i < boards.length; i++) {
            if (boards[i].isRecentlyViewed && !boards[i].isFavourite) {
                recentlyViewed.push(boards[i]);
            }
        }

        return recentlyViewed.map((value) =>
            <Board
                key={value.id}
                id={value.id}
                className={this.classNames.default}
                name={value.name}
                sendToFavourite={this.addToFavourite}
                makeListOfFavouritsVisible={this.makeListOfFavouritsVisible}
            />
        )
    }

    renderCardsFavourite = () => {
        const { boards } = this.state;
        const favouriteBoards = [];

        for (let i = 0; i < boards.length; i++) {
            if (boards[i].isFavourite) {
                favouriteBoards.push(boards[i]);
            }
        }

        return favouriteBoards.map((value) =>
            <Board
                key={value.id}
                id={value.id}
                className={this.classNames.default}
                name={value.name}
                sendToFavourite={this.addToFavourite}
                makeListOfFavouritsVisible={this.makeListOfFavouritsVisible}
            />
        )
    }

    renderProjectCards = () => {
        const { boards } = this.state;

        return boards.map((value) =>
            <Board
                key={value.id}
                id={value.id}
                background={value.background}
                className={this.classNames.default}
                name={value.name}
                sendToFavourite={this.addToFavourite}
                makeListOfFavouritsVisible={this.makeListOfFavouritsVisible}
            />
        )
    }

    search = (event) => {
        const dataLS = this.localStorage.dataset;
        const boards = [];
        const searchValue = event.target.value;

        for (let i = 0; i < dataLS.length; i++) {
            if (dataLS[i].name.indexOf(searchValue) !== -1) {
                boards.push(dataLS[i]);
            }
        }
        
        this.setState({ searchValue }, () => {
            if (this.inputSearch.current) {
                this.inputSearch.current.focus();
            }
        });

        setTimeout(() => {
            this.setState({ boards }, () => {
                if (this.inputSearch.current) {
                    this.inputSearch.current.focus();
                }
            });
        }, 300);

        const isFavouriteExists = dataLS.find( element => ( element.name.indexOf(searchValue) !== -1 && element.isFavourite )) ? true : false;
        const isRecentlyViewedExists = dataLS.find( element => ( element.name.indexOf(searchValue) !== -1 && element.isRecentlyViewed )) ? true : false;

        if (!isFavouriteExists) {
            this.setState({
                isVisibleListOfFavouritesBoards: false,
            });
        } else {
            this.setState({
                isVisibleListOfFavouritesBoards: true,
            }); 
        }

        if (!isRecentlyViewedExists) {
            this.setState({
                isVisibleRecentlyViewed: false,
            });
        } else {
            this.setState({
                isVisibleRecentlyViewed: true,
            });
        }

        if (boards.length === 0) {
            this.setState({
                isVisibleListOfFavouritesBoards: false,
                isVisibleRecentlyViewed: false
            });
        } 
    };

    render() {
        const { isOpenModalAddNewProject, searchValue } = this.state;

        return (
            <React.Fragment>
                <Route exact path='/' component={() => (
                    <React.Fragment>
                        <div className={this.classNames.overlay} />
                        <div className='control-panel'>
                            <div className='control-panel__container'>
                                <div onChange={this.search} className='left-sidebar'>
                                    <input ref={this.inputSearch} defaultValue={searchValue} className='left-sidebar__search' placeholder='' />
                                </div>
                                <div className='boards'>
                                    <AddProject
                                        isOpen={isOpenModalAddNewProject}
                                        updateIsOpen={this.updateIsOpenWindow}
                                        sendDataForCreateProject={this.getDataForCreateProject}
                                    />
                                    <div className={this.classNames.containerWithBoards}>
                                        <div className='boards__headline'>Отмеченные доски</div>
                                        <div className='boards__row'>
                                            {this.renderCardsFavourite()}
                                        </div>
                                    </div>
                                    <div className={this.classNames.containerRecentlyViewed}>
                                        <div className='boards__headline'>Недавно просмотренное</div>
                                        <div className='boards__row'>
                                            {this.renderCardsRecentlyViewed()}
                                        </div>
                                    </div>
                                    <div className='boards__container'>
                                        <div className='boards__headline'>Персональные доски</div>
                                        <div className='boards__row'>
                                            {this.renderProjectCards()}
                                            <div onClick={this.addProject} className={this.classNames.addBoard}>Создать новую доску...</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </React.Fragment>
                )} />
                <Route path='/b/:id/:name' localStorage={this.localStorage} render={ (props) => ( <ProjectPage {...props} localStorage={this.localStorage}  /> )} />
            </React.Fragment>
        );
    }
}

export default withRouter(App);