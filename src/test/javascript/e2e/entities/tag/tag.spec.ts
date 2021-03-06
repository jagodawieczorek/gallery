import { browser, element, by } from 'protractor';

import NavBarPage from './../../page-objects/navbar-page';
import SignInPage from './../../page-objects/signin-page';
import TagComponentsPage, { TagDeleteDialog } from './tag.page-object';
import TagUpdatePage from './tag-update.page-object';
import { waitUntilDisplayed, waitUntilHidden } from '../../util/utils';

const expect = chai.expect;

describe('Tag e2e test', () => {
  let navBarPage: NavBarPage;
  let signInPage: SignInPage;
  let tagComponentsPage: TagComponentsPage;
  let tagUpdatePage: TagUpdatePage;
  let tagDeleteDialog: TagDeleteDialog;

  before(async () => {
    await browser.get('/');
    navBarPage = new NavBarPage();
    signInPage = await navBarPage.getSignInPage();
    await signInPage.loginWithOAuth('admin', 'admin');
    await waitUntilDisplayed(navBarPage.entityMenu);
  });

  it('should load Tags', async () => {
    await navBarPage.getEntityPage('tag');
    tagComponentsPage = new TagComponentsPage();
    expect(await tagComponentsPage.getTitle().getText()).to.match(/Tags/);
  });

  it('should load create Tag page', async () => {
    await tagComponentsPage.clickOnCreateButton();
    tagUpdatePage = new TagUpdatePage();
    expect(await tagUpdatePage.getPageTitle().getAttribute('id')).to.match(/galleryApp.tag.home.createOrEditLabel/);
    await tagUpdatePage.cancel();
  });

  it('should create and save Tags', async () => {
    async function createTag() {
      await tagComponentsPage.clickOnCreateButton();
      await tagUpdatePage.setNameInput('name');
      expect(await tagUpdatePage.getNameInput()).to.match(/name/);
      await waitUntilDisplayed(tagUpdatePage.getSaveButton());
      await tagUpdatePage.save();
      await waitUntilHidden(tagUpdatePage.getSaveButton());
      expect(await tagUpdatePage.getSaveButton().isPresent()).to.be.false;
    }

    await createTag();
    await tagComponentsPage.waitUntilLoaded();
    const nbButtonsBeforeCreate = await tagComponentsPage.countDeleteButtons();
    await createTag();

    await tagComponentsPage.waitUntilDeleteButtonsLength(nbButtonsBeforeCreate + 1);
    expect(await tagComponentsPage.countDeleteButtons()).to.eq(nbButtonsBeforeCreate + 1);
  });

  it('should delete last Tag', async () => {
    await tagComponentsPage.waitUntilLoaded();
    const nbButtonsBeforeDelete = await tagComponentsPage.countDeleteButtons();
    await tagComponentsPage.clickOnLastDeleteButton();

    const deleteModal = element(by.className('modal'));
    await waitUntilDisplayed(deleteModal);

    tagDeleteDialog = new TagDeleteDialog();
    expect(await tagDeleteDialog.getDialogTitle().getAttribute('id')).to.match(/galleryApp.tag.delete.question/);
    await tagDeleteDialog.clickOnConfirmButton();

    await tagComponentsPage.waitUntilDeleteButtonsLength(nbButtonsBeforeDelete - 1);
    expect(await tagComponentsPage.countDeleteButtons()).to.eq(nbButtonsBeforeDelete - 1);
  });

  after(async () => {
    await navBarPage.autoSignOut();
  });
});
