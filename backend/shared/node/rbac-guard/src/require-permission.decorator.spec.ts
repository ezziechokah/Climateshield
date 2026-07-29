import { Reflector } from '@nestjs/core';

import { PUBLIC_METADATA_KEY, Public, REQUIRE_PERMISSION_METADATA_KEY, RequirePermission } from './require-permission.decorator';

describe('RequirePermission / Public decorators', () => {
  it('RequirePermission sets the csn:required-permissions metadata key on a method', () => {
    class Controller {
      @RequirePermission('risk_assessment:view', 'risk_assessment:export')
      handler(): void {
        /* noop */
      }
    }

    const reflector = new Reflector();
    const value = reflector.get(REQUIRE_PERMISSION_METADATA_KEY, Controller.prototype.handler);
    expect(value).toEqual(['risk_assessment:view', 'risk_assessment:export']);
  });

  it('RequirePermission applied to a class sets the metadata on the class itself', () => {
    @RequirePermission('gis:view')
    class Controller {}

    const reflector = new Reflector();
    const value = reflector.get(REQUIRE_PERMISSION_METADATA_KEY, Controller);
    expect(value).toEqual(['gis:view']);
  });

  it('Public sets the csn:public metadata key to true', () => {
    class Controller {
      @Public()
      health(): void {
        /* noop */
      }
    }

    const reflector = new Reflector();
    expect(reflector.get(PUBLIC_METADATA_KEY, Controller.prototype.health)).toBe(true);
  });
});
