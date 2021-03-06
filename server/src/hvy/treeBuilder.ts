/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Hvy Industries. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *  "HVY", "HVY Industries" and "Hvy Industries" are trading names of JCKD (UK) Ltd
 *--------------------------------------------------------------------------------------------*/

"use strict";

import { IConnection } from 'vscode-languageserver';
import { TreeBuilderV2 } from './treeBuilderV2';
import { Program } from 'php-parser';

import {
    FileNode,
    SymbolCache
} from './nodes';

var phpParser = require("php-parser");

let connection: IConnection;

function isset(value) {
    return typeof value != 'undefined';
}

export class TreeBuilder
{
    // v2.0 - updated to use php-parser 2.0.0-pre8
    // v1.5 - added extra types for variables
    // v1.4 - added lineCache
    // v1.3 - support for namespaces + use recursion
    // v1.2 - added option to suppress errors
    // v1.1

    // TODO -- Handle PHP written inside an HTML file (strip everything except php code)


    public SetConnection(conn: IConnection){
        connection = conn;
    }

    // Parse PHP code to generate an object tree for intellisense suggestions
    public Parse(text:string, filePath:string) : Promise<any>
    {
        return new Promise((resolve, reject) =>
        {
            var parserInst = new phpParser({
                parser: {
                    extractDoc: true,
                    suppressErrors: true
                },
                ast: {
                    withPositions: true
                }
            });

            var ast: Program = parserInst.parseCode(text);
            parserInst = null;

            this.BuildObjectTree(ast, filePath).then((tree) => {
                var symbolCache = this.BuildSymbolCache(tree, filePath).then(symbolCache => {
                    var returnObj = {
                        tree: tree,
                        symbolCache: symbolCache
                    };

                    resolve(returnObj);
                }).catch(data => {
                    reject(data);
                });
            }).catch(data => {
                reject(data);
            });
        });
    }

    public Ping(): string
    {
        return "pong";
    }

    // Convert the generated AST into a usable object tree
    private BuildObjectTree(ast: Program, filePath:string) : Promise<FileNode>
    {
        return new Promise<FileNode>((resolve, reject) =>
        {
            let tree: FileNode = new FileNode();
            let treeBuilderV2 = new TreeBuilderV2();

            tree.path = filePath;

            tree = treeBuilderV2.processBranch(ast.children, tree, null);
            treeBuilderV2.buildNamespaceParts(tree);

            resolve(tree);
        });
    }

    // Crunch through the generated tree to build a cache of symbols in this file
    private BuildSymbolCache(tree:FileNode, filePath:string) : Promise<SymbolCache[]>
    {
        return new Promise<SymbolCache[]>((resolve, reject) => {
            let cache: SymbolCache[] = [];
            // TODO
            resolve(cache);
        });
    }
}
