

export const NavBar = () => {
  return (
    <nav className="bg-bgp1 border-bgs1">
      <div className="flex flex-row gap-2">
        <button onClick={goHome}>
          <HomeIcon />
        </button>
        <button onClick={submitFile}>
          <DocumentPlusIcon />
        </button>
        <div className="grid gap-2 grid-cols-1 overflow-y-auto flex-1 min-w-0">
          <div className="flex-1 min-w-0 input-group">
            <div className="flex flex-1 min-w-0 relative items-center input-group">
              <input type="text" placeholder="Search name..."
                value={queryName} onChange={onChangeName} onKeyDown={onKeyDown} />
              {isExpanded ?
                (<ChevronUpIcon className="icon-control" onClick={toggleExpand} />) :
                (<ChevronDownIcon className="icon-control" onClick={toggleExpand} />)
              }
            </div>
            <button onClick={onSubmit} >
              <MagnifyingGlassIcon />
            </button>
          </div>
          {isExpanded && (
            <React.Fragment>
              <input type="text" placeholder="Search extension..."
                value={queryExtension} onChange={onChangeExtension} onKeyDown={onKeyDown} />
              <select onChange={onChangePrivacy} defaultValue={queryPrivacy}>
                <option value="">No Privacy Filter</option>
                <option value="private">Private</option>
                <option value="pals">Pals Only</option>
                <option value="public">Public</option>
              </select>
              <div className="flex flex-1 min-w-0 relative items-center">
                <input type="text" placeholder="Search author..."
                  value={queryAuthor} onChange={onChangeAuthor} onKeyDown={onKeyDown} />
                <UserIcon className="icon-control" onClick={autofillAuthor} />
              </div>
            </React.Fragment>
          )}
        </div>
      </div>
    </nav>
  );
}
