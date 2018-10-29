import {Model} from "@mean-expert/model";

/**
 * @module Organization
 * @description
 * Write a useful organization Model description.
 * Register hooks and remote methods within the
 * Model Decorator
 **/
@Model({
  hooks: {
    beforeSave: {name: "before save", type: "operation"},
    beforeDelete: {name: "before delete", type: "operation"}
  },
  remotes: {
    getFilteredMessages: {
      accepts: [
        {arg: "id", type: "string", required: true, description: "Organization id"},
        {arg: "filter", type: "object", required: true, description: "Message filter"},
        {arg: "req", type: "object", http: {source: "req"}},
      ],
      http: {
        path: "/:id/FilteredMessages",
        verb: "get",
      },
      returns: {type: ["Message"], root: true},
    },
  },
})

class Organization {
  // LoopBack model instance is injected in constructor
  constructor(public model: any) {
  }

  public beforeSave(ctx: any, next: Function): void {
    console.log("organization: Before Save");
    if (ctx.instance) ctx.instance.createdAt = new Date();
    next();
  }

  // Before delete, remove all organizaton models links
  public beforeDelete(ctx: any, next: Function): void {
    // Models
    const User = this.model.app.models.User;
    const Organization = this.model;
    const Category = this.model.app.models.Category;
    const Device = this.model.app.models.Device;
    const Message = this.model.app.models.Message;

    const organizationId = ctx.where.id;

    Organization.findOne({
      where: {id: organizationId},
      include: ["Members", "Categories", "Devices", "Messages", "Dashboards"],
    }, (err: any, organization: any) => {
      // console.log(category);
      if (!err && organization) {
        organization.toJSON().Members.forEach((member: any) => {
          organization.Members.remove(member.id, (err: any) => {
            console.log("Unlinked members from organization");
          });
        });
        organization.toJSON().Categories.forEach((category: any) => {
          organization.Categories.remove(category.id, (err: any) => {
            console.log("Unlinked categories from organization");
          });
        });
        organization.toJSON().Devices.forEach((device: any) => {
          organization.Devices.remove(device.id, (err: any) => {
            console.log("Unlinked devices from organization");
          });
        });
        organization.toJSON().Messages.forEach((message: any) => {
          organization.Messages.remove(message.id, (err: any) => {
            console.log("Unlinked messages from organization");
          });
        });
      } else {
        console.error(err);
      }
    });
    next();
  }

  public getFilteredMessages(organizationId: string, filter: any, req: any, next: Function): void {
    // Models
    const Organization = this.model;
    const Message = this.model.app.models.Message;

    const userId = req.accessToken.userId;
    if (!userId) {
      next(null, "Please login or use a valid access token.");
    }

    Organization.findById(
      organizationId,
      {include: ["Devices"]}, (err: any, organization: any) => {
        if (!err && organization) {
          if (filter.where && filter.where.deviceId) {
            for (let device of organization.toJSON().Devices) {
              if (filter.where.deviceId === device.id) {
                Message.find(filter, (err: any, messages: any) => {
                  if (!err) next(null, messages);
                  else next(err);
                });
                break;
              }
            }
          } else {
            const devicesIds: any[] = [];
            organization.toJSON().Devices.forEach((device: any) => {
              devicesIds.push(device.id);
            });
            filter.where = {deviceId: {inq: devicesIds}};
            Message.find(filter, (err: any, messages: any) => {
              if (!err) next(null, messages);
              else next(err);
            });
          }
        } else next(err);
      });
  }
}

module.exports = Organization;