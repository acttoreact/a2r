import ts from 'typescript';

import { JSDocContainer } from '../../model/watcher';

const getFunctionDocContainer = (
  node: ts.FunctionDeclaration | ts.ArrowFunction | null,
): JSDocContainer | null => {
  if (!node) {
    return null;
  }
  if (ts.isFunctionDeclaration(node)) {
    return node as JSDocContainer;
  }
  if (ts.isArrowFunction(node)) {
    let statement = node.parent;
    while (statement && !ts.isVariableStatement(statement)) {
      statement = statement.parent;
    }
    return statement as JSDocContainer;
  }
  return null;
};

export default getFunctionDocContainer;
