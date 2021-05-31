import * as t from '@babel/types';
import R from 'ramda';
import { TranspilerInterface, TraverseObject } from './transpiler.interface';
import type { CubeSymbols } from '../CubeSymbols';
import type { CubeDictionary } from '../CubeDictionary';

export class CubePropContextTranspiler implements TranspilerInterface {
  public constructor(
    protected readonly cubeSymbols: CubeSymbols,
    protected readonly cubeDictionary: CubeDictionary,
  ) {
  }

  public traverseObject(): TraverseObject {
    const self = this;

    return {
      CallExpression(path) {
        if (t.isIdentifier(path.node.callee)) {
          const args = path.get('arguments');
          if (['view', 'cube'].includes(path.node.callee.name)) {
            if (args && args[args.length - 1]) {
              const cubeName = args[0].node.type === 'StringLiteral' && args[0].node.value ||
                args[0].node.type === 'TemplateLiteral' &&
                args[0].node.quasis.length &&
                args[0].node.quasis[0].value.cooked;
              args[args.length - 1].traverse(self.sqlAndReferencesFieldVisitor(cubeName));
              args[args.length - 1].traverse(
                self.knownIdentifiersInjectVisitor('extends', name => self.cubeDictionary.resolveCube(name))
              );
            }
          } else if (path.node.callee.name === 'context') {
            args[args.length - 1].traverse(self.sqlAndReferencesFieldVisitor(null));
          }
        }
      }
    };
  }

  protected sqlAndReferencesFieldVisitor(cubeName: string|null) {
    return this.knownIdentifiersInjectVisitor(
      /^(sql|measureReferences|dimensionReferences|segmentReferences|timeDimensionReference|rollupReferences|drillMembers|drillMemberReferences|contextMembers|columns)$/,
      name => this.cubeSymbols.resolveSymbol(cubeName, name) || this.cubeSymbols.isCurrentCube(name)
    );
  }

  protected knownIdentifiersInjectVisitor(field: RegExp|string, resolveSymbol: (name: string) => void): TraverseObject {
    const self = this;

    return {
      ObjectProperty(path) {
        if (t.isIdentifier(path.node.key) && path.node.key.name.match(field)) {
          const knownIds = self.collectKnownIdentifiers(
            resolveSymbol,
            path.get('value')
          );
          path.get('value').replaceWith(
            t.arrowFunctionExpression(
              knownIds.map(i => t.identifier(i)),
              // @todo Replace any with assert expression
              <any>path.node.value,
              false
            )
          );
        }
      }
    };
  }

  protected collectKnownIdentifiers(resolveSymbol, path) {
    const identifiers = [];
    const self = this;
    if (path.node.type === 'Identifier') {
      this.matchAndPushIdentifier(path, resolveSymbol, identifiers);
    }
    path.traverse({
      Identifier(p) {
        self.matchAndPushIdentifier(p, resolveSymbol, identifiers);
      }
    });
    return R.uniq(identifiers);
  }

  protected matchAndPushIdentifier(path, resolveSymbol, identifiers) {
    if (
      (!path.parent ||
        (path.parent.type !== 'MemberExpression' || path.parent.type === 'MemberExpression' && path.key !== 'property')
      ) &&
      resolveSymbol(path.node.name)
    ) {
      identifiers.push(path.node.name);
    }
  }
}
