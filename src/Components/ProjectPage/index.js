import React, { Component } from 'react';
import LocalStorage from '../localStorage';
import projectInfo from '../../../package.json';
import './index.scss';

export default class ProjectPage extends Component {
    constructor(props) {
        super();
        this.localStorage = new LocalStorage(projectInfo.version, projectInfo.name);
        this.init(props);
    }

    init = (props) => {
        const id = props.match.params.id;
        const LC = this.localStorage.dataset;   
        let now = new Date();
        
        for (let i = 0; i < LC.length; i++) {
            if (LC[i].id === id) {
                LC[i].time ? LC[i].time = now.getTime() : LC[i].time = now.getTime();            
                LC[i].isAddedToRecentlyViewed ? LC[i].isAddedToRecentlyViewed = true : LC[i].isAddedToRecentlyViewed = true;
            }
        }

        this.localStorage.dataset = LC;
    }


    getProjectName = () => {
        let temp = this.localStorage.dataset;


        for(let i = 0; i < temp.length; i++) {
            if ( temp[i].id === this.props.match.params.id) {
                return temp[i].projectName;
            }
        }
    }

    render() {
        return (
            <div className='project-board'>
                <div className='header-board'>
                    <div className='project-board__name'>{this.getProjectName()}</div>
                </div>
                <div className='project-board__body'>
                    <div className='add-list'>+ Добавить список</div>
                </div>
            </div>

        )
    }
}