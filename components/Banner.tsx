export default function Banner() {
  return (
    <div className="container-fluid px-3 mt-3">
      <div className="banner-card">
        <div className="row align-items-center">
          <div className="col-8">
            <h6 className="text-white fw-bold mb-1">برنامه حسابداری هیتاپ</h6>
            <p className="text-white-50 small mb-0">مدیریت کامل کسب و کار شما</p>
          </div>
          <div className="col-4 text-end">
            <div className="banner-icons">
              <i className="bi bi-laptop text-white-50 me-2"></i>
              <i className="bi bi-phone text-white-50"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
