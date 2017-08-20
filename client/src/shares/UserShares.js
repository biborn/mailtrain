'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { requiresAuthenticatedUser, withPageHelpers, Title } from '../lib/page';
import { withErrorHandling, withAsyncErrorHandler } from '../lib/error-handling';
import { Table } from '../lib/table';
import axios from '../lib/axios';
import mailtrainConfig from 'mailtrainConfig';
import {Icon} from "../lib/bootstrap-components";

@translate()
@withPageHelpers
@withErrorHandling
@requiresAuthenticatedUser
export default class UserShares extends Component {
    constructor(props) {
        super(props);

        this.sharesTables = {};
    }

    static propTypes = {
        user: PropTypes.object
    }

    @withAsyncErrorHandler
    async deleteShare(entityTypeId, entityId) {
        const data = {
            entityTypeId,
            entityId,
            userId: this.props.user.id
        };

        await axios.put('/rest/shares', data);
        for (const key in this.sharesTables) {
            this.sharesTables[key].refresh();
        }
    }

    componentDidMount() {
    }

    render() {
        const t = this.props.t;

        const renderSharesTable = (entityTypeId, title) => {
            const columns = [
                { data: 0, title: t('Name') },
                { data: 1, title: t('Role') },
                {
                    actions: data => {
                        const actions = [];
                        const autoGenerated = data[3];
                        const perms = data[4];

                        if (!autoGenerated && perms.includes('share')) {
                            actions.push({
                                label: <Icon icon="remove" title={t('Remove')}/>,
                                action: () => this.deleteShare(entityTypeId, data[2])
                            });
                        }

                        return actions;
                    }
                }
            ];

            return (
                <div>
                    <h3>{title}</h3>
                    <Table ref={node => this.sharesTables[entityTypeId] = node} withHeader dataUrl={`/rest/shares-table-by-user/${entityTypeId}/${this.props.user.id}`} columns={columns} />
                </div>
            );
        };

        return (
            <div>
                <Title>{t('Shares for user "{{username}}"', {username: this.props.user.username})}</Title>

                {renderSharesTable('namespace', t('Namespaces'))}
                {renderSharesTable('list', t('Lists'))}
                {renderSharesTable('customForm', t('Custom Forms'))}
                {renderSharesTable('report', t('Reports'))}
                {renderSharesTable('reportTemplate', t('Report Templates'))}
            </div>
        );
    }
}
